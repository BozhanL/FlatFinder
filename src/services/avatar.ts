import { supabase } from "@/lib/supabase";
import { getAuth } from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from "@react-native-firebase/firestore";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import type { Dispatch, SetStateAction } from "react";

type PhotoUrls = string[];

// read photoUrls from Firestore
async function readPhotoUrls(uid: string): Promise<PhotoUrls> {
  const snap = await getDoc(doc(getFirestore(), "users", uid));
  const data = snap.data() as { photoUrls?: unknown } | undefined;
  return Array.isArray(data?.photoUrls) ? (data.photoUrls as string[]) : [];
}

async function writePhotoUrls(uid: string, urls: PhotoUrls): Promise<void> {
  await updateDoc(doc(getFirestore(), "users", uid), { photoUrls: urls });
}

function toPublicUrl(path: string, w = 1024, h = 1024): string {
  const { data } = supabase.storage.from("avatar").getPublicUrl(path);
  return `${data.publicUrl}?width=${w}&height=${h}&resize=cover&quality=80&v=${Date.now()}`;
}

function storagePathFromPublicUrl(publicUrl: string): string | null {
  try {
    const marker = "/storage/v1/object/public/avatar/";
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) {
      return null;
    }
    return publicUrl.substring(idx + marker.length); // => "uid/xxx.jpg"
  } catch {
    return null;
  }
}

/** list user photos */
export async function listUserPhotos(): Promise<string[]> {
  const uid = getAuth().currentUser?.uid;
  if (!uid) {
    throw new Error("Unauthenticated");
  }
  return readPhotoUrls(uid);
}

/** upload a photo, append to the end of the array (error if more than 3) */
export async function uploadUserPhoto(): Promise<string | null> {
  const uid = getAuth().currentUser?.uid;
  if (!uid) {
    throw new Error("Unauthenticated");
  }

  const urls = await readPhotoUrls(uid);
  if (urls.length >= 3) {
    throw new Error("No more than 3 photos allowed");
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== ImagePicker.PermissionStatus.GRANTED) {
    throw new Error("media library permission denied");
  }

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.92,
  });
  if (picked.canceled || !picked.assets.length) {
    return null;
  }

  const asset = picked.assets[0];
  if (!asset) {
    return null;
  }
  const ext =
    mime.getExtension(asset.mimeType || "") ||
    asset.uri.split(".").pop() ||
    "jpg";

  const fileName = `${Date.now()}.${ext}`;
  const path = `${uid}/${fileName}`;

  let readUri = asset.uri;
  if (readUri.startsWith("content://")) {
    const cacheDir = FileSystem.cacheDirectory ?? "";
    const tmp = cacheDir + fileName;
    await FileSystem.copyAsync({ from: readUri, to: tmp });
    readUri = tmp;
  }
  const base64 = await FileSystem.readAsStringAsync(readUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = decode(base64);

  const { error } = await supabase.storage
    .from("avatar")
    .upload(path, arrayBuffer, {
      contentType: asset.mimeType || "image/jpeg",
      upsert: true,
    });
  if (error) {
    throw error;
  }

  const publicUrl = toPublicUrl(path);

  const next = [...urls, publicUrl];
  await writePhotoUrls(uid, next);

  await updateDoc(doc(getFirestore(), "users", uid), {
    avatarUrl: next[0] ?? null,
  });

  console.log("Uploaded to:", path);
  console.log("Public URL:", publicUrl);

  return publicUrl;
}

/** delete a photo by index */
export async function deleteUserPhoto(index: number): Promise<string[]> {
  const uid = getAuth().currentUser?.uid;
  if (!uid) {
    throw new Error("Unauthenticated");
  }

  const urls = await readPhotoUrls(uid);
  const target = urls[index];
  if (!target) {
    return urls;
  }

  const storagePath = storagePathFromPublicUrl(target);
  if (storagePath) {
    const { error } = await supabase.storage
      .from("avatar")
      .remove([storagePath]);
    if (error) {
      throw error;
    }
  }

  const next = urls.filter((_, i) => i !== index);

  await writePhotoUrls(uid, next);

  await updateDoc(doc(getFirestore(), "users", uid), {
    avatarUrl: next[0] ?? null,
  });

  return next;
}
export async function syncAvatarFromPhotos(
  photos: string[],
  setForm: Dispatch<SetStateAction<{ avatarUrl?: string | null } | null>>,
): Promise<void> {
  const first =
    photos.find((u) => typeof u === "string" && u.trim().length > 0) ?? null;
  const uid = getAuth().currentUser?.uid;
  if (!uid) {
    return;
  }

  setForm((prev: { avatarUrl?: string | null } | null) => {
    const cur = prev?.avatarUrl ?? null;
    if (cur === first) {
      return prev;
    }
    return prev ? { ...prev, avatarUrl: first } : prev;
  });

  try {
    await updateDoc(doc(getFirestore(), "users", uid), { avatarUrl: first });
  } catch (err) {
    console.error(err);
  }
}

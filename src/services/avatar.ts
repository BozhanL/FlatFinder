import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import { supabase } from "@/lib/supabase";
import { getAuth } from "@react-native-firebase/auth";
import { doc, getFirestore, getDoc, updateDoc } from "@react-native-firebase/firestore";

type PhotoUrls = string[];

// read photoUrls from Firestore
async function readPhotoUrls(uid: string): Promise<PhotoUrls> {
  const snap = await getDoc(doc(getFirestore(), "users", uid));
  const data = snap.data() as { photoUrls?: unknown } | undefined;
  return Array.isArray(data?.photoUrls) ? (data!.photoUrls as string[]) : [];
}

async function writePhotoUrls(uid: string, urls: PhotoUrls) {
  await updateDoc(doc(getFirestore(), "users", uid), { photoUrls: urls });
}

function toPublicUrl(path: string, w = 1024, h = 1024) {
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?width=${w}&height=${h}&resize=cover&quality=80&v=${Date.now()}`;
}

/** list user photos */
export async function listUserPhotos(): Promise<string[]> {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Unauthenticated");
  return readPhotoUrls(uid);
}

/** upload a photo, append to the end of the array (error if more than 3) */
export async function uploadUserPhoto(): Promise<string | null> {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Unauthenticated");

  const urls = await readPhotoUrls(uid);
  if (urls.length >= 3) throw new Error("No more than 3 photos allowed");

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") throw new Error("media library permission denied");

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.92,
  });
  if (picked.canceled) return null;

  const asset = picked.assets?.[0]!;
  const ext =
    mime.getExtension(asset.mimeType || "") ||
    asset.uri.split(".").pop() ||
    "jpg";

  const fileName = `${Date.now()}.${ext}`;
  const path = `${uid}/${fileName}`;

  const resp = await fetch(asset.uri);
  const blob = await resp.blob();

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, blob, {
      contentType: asset.mimeType || "image/jpeg",
      upsert: false,
    });
  if (error) throw error;

  const publicUrl = toPublicUrl(path);

  const next = [...urls, publicUrl];
  await writePhotoUrls(uid, next);

  return publicUrl;
}

/** delete a photo by index */
export async function deleteUserPhoto(index: number): Promise<void> {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("unauthenticated");

  const urls = await readPhotoUrls(uid);
  if (index < 0 || index >= urls.length) return;

  const url = urls?.[index]!;

  try {
    const marker = "/storage/v1/object/public/avatars/";
    const qIdx = url.indexOf("?");
    const cut = url.substring(url.indexOf(marker) + marker.length, qIdx === -1 ? url.length : qIdx);
    await supabase.storage.from("avatars").remove([cut]);
  } catch {
  }

  const next = urls.filter((_, i) => i !== index);
  await writePhotoUrls(uid, next);
}

export async function moveUserPhoto(index: number, newIndex: number): Promise<void> {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("unauthenticated");

  const arr = await readPhotoUrls(uid);
  if (index < 0 || index >= arr.length) return;
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= arr.length) newIndex = arr.length - 1;

  const [item] = arr.splice(index, 1);
  if (item === undefined) return;
  arr.splice(newIndex, 0, item);
  await writePhotoUrls(uid, arr);
}

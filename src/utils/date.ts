import { Timestamp } from "@react-native-firebase/firestore";

export function calculateAge(dob: Timestamp | string | null | undefined): number | undefined {
  if (!dob) return undefined;
  
  let birthDate: Date;
  
  if (dob instanceof Timestamp) {
    birthDate = dob.toDate();
  } else if (typeof dob === "string") {
    birthDate = new Date(dob);
  } else {
    return undefined;
  }
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function formatDOB(dob: Timestamp | Date | string): string {
  let date: Date;
  
  if (dob instanceof Timestamp) {
    date = dob.toDate();
  } else if (dob instanceof Date) {
    date = dob;
  } else {
    date = new Date(dob);
  }
  
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export const formatDDMMYYYY = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};

export const parseDDMMYYYY = (s: string): Date | null => {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (!m) return null;
  const day = Number(m[1]), month = Number(m[2]), year = Number(m[3]);
  const dt = new Date(year, month - 1, day);
  return isNaN(dt.getTime()) ? null : dt;
};


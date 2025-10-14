import { Timestamp } from "@react-native-firebase/firestore";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

function toDayjs(
  d: Timestamp | string | Date | null | undefined,
): dayjs.Dayjs | null {
  if (!d) {
    return null;
  }
  if (d instanceof Timestamp) {
    return dayjs(d.toDate());
  }
  if (d instanceof Date) {
    return dayjs(d);
  }
  if (typeof d === "string") {
    return dayjs(d);
  }
  return null;
}

export function calculateAge(
  dob: Timestamp | string | null | undefined,
): number | undefined {
  const b = toDayjs(dob);
  if (!b?.isValid()) {
    return undefined;
  }

  const today = dayjs();
  const age = today.diff(b, "year");
  return age;
}

export function formatDOB(dob: Timestamp | Date | string): string {
  const d =
    dob instanceof Timestamp
      ? dayjs(dob.toDate())
      : dob instanceof Date
        ? dayjs(dob)
        : dayjs(dob);

  return d.isValid() ? d.format("MMMM D, YYYY") : "";
}

export function formatDDMMYYYY(d: Date): string {
  const dj = dayjs(d);
  return dj.isValid() ? dj.format("DD-MM-YYYY") : "";
}

export function parseDDMMYYYY(s: string): Date | null {
  const d = dayjs(s, "DD-MM-YYYY", true);
  return d.isValid() ? d.toDate() : null;
}

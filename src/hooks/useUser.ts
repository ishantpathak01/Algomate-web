"use client";

import { useEffect, useState } from "react";
import type { StudentProfile } from "@/types/user";
import { getStudentProfile } from "@/features/users/services/profile";

type UserState =
  | { status: "loading"; profile: null; error: null }
  | { status: "loaded"; profile: StudentProfile; error: null }
  | { status: "error"; profile: null; error: Error };

export default function useUser() {
  const [state, setState] = useState<UserState>({
    status: "loading",
    profile: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    getStudentProfile().then(
      (profile) => {
        if (active) setState({ status: "loaded", profile, error: null });
      },
      (error: unknown) => {
        if (active) {
          setState({
            status: "error",
            profile: null,
            error: error instanceof Error ? error : new Error("Unable to load your profile."),
          });
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return state;
}

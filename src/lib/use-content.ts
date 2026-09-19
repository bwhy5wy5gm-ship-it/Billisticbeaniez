"use client";

import { useEffect, useState, useCallback } from "react";
import { defaults } from "./content-defaults";

let globalContent: Record<string, string> | null = null;
let globalVersion = 0;

export function useContent() {
  const [content, setContent] = useState<Record<string, string>>(
    globalContent ?? defaults
  );
  const [version, setVersion] = useState(globalVersion);

  useEffect(() => {
    if (globalContent) {
      setContent(globalContent);
      return;
    }
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          const merged = { ...defaults, ...data };
          globalContent = merged;
          setContent(merged);
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, []);

  useEffect(() => {
    const check = () => {
      if (globalVersion !== version) {
        setVersion(globalVersion);
        fetch("/api/admin/content")
          .then((r) => r.json())
          .then((data) => {
            if (data && typeof data === "object") {
              const merged = { ...defaults, ...data };
              globalContent = merged;
              setContent(merged);
            }
          })
          .catch(() => {});
      }
    };
    const id = setInterval(check, 500);
    return () => clearInterval(id);
  }, [version]);

  const getContent = useCallback(
    (key: string, fallback: string) => content[key] ?? fallback,
    [content]
  );

  return { getContent, loading: false };
}

export function invalidateContent() {
  globalContent = null;
  globalVersion++;
}

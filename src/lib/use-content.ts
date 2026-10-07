"use client";

import { useEffect, useState, useCallback } from "react";
import { defaults } from "./content-defaults";

let globalContent: Record<string, string> | null = null;
let globalVersion = 0;

function mergeContent(data: Record<string, unknown>) {
  if (!data || typeof data !== "object" || data.error) return;
  const merged = { ...defaults, ...(data as Record<string, string>) };
  globalContent = merged;
}

export function useContent() {
  const [content, setContent] = useState<Record<string, string>>(
    globalContent ?? defaults
  );
  const [version, setVersion] = useState(globalVersion);
  const [loaded, setLoaded] = useState(globalContent !== null);

  useEffect(() => {
    if (globalContent) return;
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          mergeContent(data);
          if (globalContent) {
            setContent(globalContent);
            setLoaded(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const check = () => {
      if (globalVersion !== version) {
        setVersion(globalVersion);
        fetch("/api/content")
          .then((r) => r.json())
          .then((data) => {
            mergeContent(data);
            if (globalContent) {
              setContent(globalContent);
              setLoaded(true);
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

  return { getContent, loaded, loading: false };
}

export function invalidateContent() {
  globalContent = null;
  globalVersion++;
}

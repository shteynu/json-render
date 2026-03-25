import { createNextApp } from "@json-render/next/server";
import { defaultSpec } from "./default-spec";

export const { getPageData, generateMetadata, generateStaticParams } =
  createNextApp({
    spec: defaultSpec,
  });

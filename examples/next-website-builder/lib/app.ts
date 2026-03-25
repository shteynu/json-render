import { createNextApp } from "@json-render/next/server";
import { defaultSpec } from "./default-spec";

export const { Page, generateMetadata, generateStaticParams } = createNextApp({
  spec: defaultSpec,
});

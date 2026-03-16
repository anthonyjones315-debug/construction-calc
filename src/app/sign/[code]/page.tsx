import { notFound } from "next/navigation";
import { getPublicEstimateByShareCode } from "@/lib/dal/public-estimates";
import { SignEstimateClient } from "./SignEstimateClient";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function SignEstimatePage({ params }: Props) {
  const { code } = await params;
  const estimate = await getPublicEstimateByShareCode(code);

  if (!estimate) {
    notFound();
  }

  return <SignEstimateClient estimate={estimate} />;
}

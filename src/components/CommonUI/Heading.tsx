interface headingInterFace {
  title: string;
  baseLine?: boolean;
  baselineClassName?: string;
  marginBottom?: string;
  alignCenter?: boolean;
}

export default function Heading({
  title = "",
  baseLine = true,
  baselineClassName = "",
  marginBottom = "mb-4",
  alignCenter = false,
}: headingInterFace) {
  return (
    <h2
      className={`text-xl font-semibold ${
        alignCenter ? "text-center" : "text-start"
      } dark:text-white sm:text-2xl ${marginBottom}`}
    >
      {title}
      {baseLine && <hr className={baselineClassName + "mt-1"} />}
    </h2>
  );
}

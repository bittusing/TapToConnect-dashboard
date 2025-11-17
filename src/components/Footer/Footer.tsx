
export default function Footer() {
  return (
    <footer className="flex w-full flex-col sm:flex-row items-center justify-center sm:items-center sm:justify-between border-b border-stroke bg-white p-4 dark:border-stroke-dark dark:bg-gray-dark sm:text-sm text-xs gap-2">
      <span className="text-center">
        <a
          href="https://www.codeconnect.in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Coders Adda in partner with 
          Code Connect{" "}
        </a>{" "}
        <a
          href="https://www.codeconnect.in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          | Term of Service{" "}
        </a>{" "}
        <a
          href="https://www.codeconnect.in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          | Privacy Policy{" "}
        </a>{" "}
        <a
          href="https://forms.gle/7f4nmkJN9zMMfyiH9"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green"
        >
          | Share Feedback
        </a>{" "}
      </span>
      <span>
        All rights reserved{" "}
        <a
          href="https://www.codeconnect.in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          © Code Connect
        </a>{" "}
        {new Date().getFullYear()}
      </span>
    </footer>
  );
}

export default function Card({ children, className = "" }: any) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

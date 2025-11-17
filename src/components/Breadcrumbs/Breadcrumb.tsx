import { Link } from "react-router-dom";

interface BreadcrumbProps {
  pageName: string;
  onlyHeading?: boolean;
}

const Breadcrumb = ({ pageName, onlyHeading = true }: BreadcrumbProps) => {
  return (
    <div className="sm:mb-6 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="sm:text-[26px] text-[22px] font-bold leading-[30px] text-dark dark:text-white">
        {pageName}
      </h2>

      {!onlyHeading && (
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link className="font-medium" to="/">
                Dashboard /
              </Link>
            </li>
            <li className="font-medium text-primary">{pageName}</li>
          </ol>
        </nav>
      )}
    </div>
  );
};

export default Breadcrumb;

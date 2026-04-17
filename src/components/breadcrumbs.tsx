import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol className="breadcrumb__list">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="breadcrumb__item">
              {item.href && !isCurrent ? (
                <Link href={item.href} className="breadcrumb__link">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? "page" : undefined} className="breadcrumb__current">
                  {item.label}
                </span>
              )}
              {!isCurrent ? <span className="breadcrumb__separator">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

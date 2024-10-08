import { Category } from './mockedApi';

export interface CategoryListElement {
  name: string;
  id: number;
  image: string;
  order: number;
  children: CategoryListElement[];
  showOnHome: boolean;
}

const getShowOnHome = (params: {
  level: number;
  levelLength: number;
  marked: Set<string>;
  index: number;
  title: string;
}): boolean => {
  if (params.level !== 0) return false; // show only on first level
  if (params.levelLength <= 5) return true; // show all if <= 5
  if (params.marked.size > 0) return params.marked.has(params.title); // show only marked
  return params.index < 3; // show first 3
};

const getMarkedCategories = (categories: Category[]): Set<string> =>
  new Set(
    categories
      .filter((category) => category.Title && category.Title.includes('#'))
      .map((category) => category.Title)
  );

const getOrder = (title: string, id: number, marked: Set<string>): number => {
  const orderNumber = parseInt(marked.has(title) ? title.split('#')[0] : title);
  return isNaN(orderNumber) ? id : orderNumber;
};

const sortChildren = (children: CategoryListElement[]): CategoryListElement[] =>
  children.sort((a, b) => a.order - b.order);

const parse = (categories: Category[] = [], level = 0): CategoryListElement[] =>
  categories.length === 0
    ? []
    : categories.map((category, index) => {
        const marked = getMarkedCategories(categories);
        return {
          children: sortChildren(parse(category.children, level + 1)),
          name: category.name,
          id: category.id,
          image: category.MetaTagDescription,
          order: getOrder(category.Title, category.id, marked),
          showOnHome: getShowOnHome({
            level,
            levelLength: categories.length,
            marked,
            index,
            title: category.Title,
          }),
        };
      });

export const categoryTree = async (
  getData: () => Promise<{ data: Category[] }>
): Promise<CategoryListElement[]> =>
  getData().then(({ data = [] }) => parse(data));

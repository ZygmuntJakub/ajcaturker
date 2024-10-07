/*
!!! This is the old solution with the fix applied !!!
!!! DO NOT CHECK THIS FILE !!!
!!! IS ONLY FOR COMPARISON !!!
*/

import { Category } from './mockedApi';

export interface CategoryListElement {
  name: string;
  id: number;
  image: string;
  order: number;
  children: CategoryListElement[];
  showOnHome: boolean;
}

/** @deprecated */
export const categoryTree = async (
  getData: () => Promise<{ data: Category[] }>
): Promise<CategoryListElement[]> => {
  const res = await getData();

  if (!res.data) {
    return [];
  }

  const toShowOnHome: number[] = [];

  const result = res.data.map((c1) => {
    let order = c1.Title;
    if (c1.Title && c1.Title.includes('#')) {
      order = c1.Title.split('#')[0];
      toShowOnHome.push(c1.id);
    }

    let orderL1 = parseInt(order);
    if (isNaN(orderL1)) {
      orderL1 = c1.id;
    }
    const l2Kids = c1.children
      ? c1.children.map((c2) => {
          let order2 = c2.Title;
          if (c2.Title && c2.Title.includes('#')) {
            order2 = c2.Title.split('#')[0];
          }
          let orderL2 = parseInt(order2);
          if (isNaN(orderL2)) {
            orderL2 = c2.id;
          }
          const l3Kids = c2.children
            ? c2.children.map((c3) => {
                let order3 = c3.Title;
                if (c3.Title && c3.Title.includes('#')) {
                  order3 = c3.Title.split('#')[0];
                }
                let orderL3 = parseInt(order3);
                if (isNaN(orderL3)) {
                  orderL3 = c3.id;
                }
                return {
                  id: c3.id,
                  image: c3.MetaTagDescription,
                  name: c3.name,
                  order: orderL3,
                  children: [],
                  showOnHome: false,
                };
              })
            : [];
          l3Kids.sort((a, b) => a.order - b.order);
          return {
            id: c2.id,
            image: c2.MetaTagDescription,
            name: c2.name,
            order: orderL2,
            children: l3Kids,
            showOnHome: false,
          };
        })
      : [];
    l2Kids.sort((a, b) => a.order - b.order);
    return {
      id: c1.id,
      image: c1.MetaTagDescription,
      name: c1.name,
      order: orderL1,
      children: l2Kids,
      showOnHome: false,
    };
  });

  result.sort((a, b) => a.order - b.order);

  if (result.length <= 5) {
    result.forEach((a) => (a.showOnHome = true));
  } else if (toShowOnHome.length > 0) {
    result.forEach((x) => (x.showOnHome = toShowOnHome.includes(x.id)));
  } else {
    result.forEach((x, index) => (x.showOnHome = index < 3));
  }

  return result;
};

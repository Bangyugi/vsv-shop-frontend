import type {
  ApiCategory,
  MegaMenuCategory,
  MegaMenuData,
} from "../types/category";

/**
 * Xây dựng cấu trúc dữ liệu lồng nhau cho MegaMenu từ danh sách categories phẳng.
 * Chỉ lấy tối đa level 3.
 * @param categories Danh sách categories phẳng từ API.
 * @returns Object với key là tên category level 1, value là mảng các category level 2 (có chứa children level 3).
 */
export const buildMegaMenuData = (categories: ApiCategory[]): MegaMenuData => {
  const megaMenuData: MegaMenuData = {};
  const categoryMap = new Map<number, MegaMenuCategory>();

  categories.forEach((cat) => {
    categoryMap.set(cat.id, { id: cat.id, name: cat.name, children: [] });
  });

  categories.forEach((cat) => {
    const currentCategoryNode = categoryMap.get(cat.id);
    if (!currentCategoryNode) return;

    if (cat.parentCategory && cat.level === 2) {
      const parentNodeLevel1 = categoryMap.get(cat.parentCategory.id);
      if (parentNodeLevel1) {
        if (
          !parentNodeLevel1.children.some(
            (child) => child.id === currentCategoryNode.id
          )
        ) {
          parentNodeLevel1.children.push(currentCategoryNode);
        }

        if (!megaMenuData[parentNodeLevel1.name]) {
          megaMenuData[parentNodeLevel1.name] = [];
        }

        if (
          !megaMenuData[parentNodeLevel1.name].some(
            (child) => child.id === currentCategoryNode.id
          )
        ) {
          megaMenuData[parentNodeLevel1.name].push(currentCategoryNode);
        }
      }
    } else if (cat.parentCategory && cat.level === 3) {
      const parentNodeLevel2 = categoryMap.get(cat.parentCategory.id);
      if (parentNodeLevel2) {
        if (
          !parentNodeLevel2.children.some(
            (child) => child.id === currentCategoryNode.id
          )
        ) {
          parentNodeLevel2.children.push(currentCategoryNode);
        }
      }
    } else if (cat.level === 1) {
      if (!megaMenuData[currentCategoryNode.name]) {
        megaMenuData[currentCategoryNode.name] = [];
      }
    }
  });

  for (const key in megaMenuData) {
    megaMenuData[key].sort((a, b) => a.name.localeCompare(b.name));
    megaMenuData[key].forEach((level2) => {
      level2.children.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  return megaMenuData;
};

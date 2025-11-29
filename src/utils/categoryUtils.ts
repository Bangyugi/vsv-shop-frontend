// src/utils/categoryUtils.ts
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

  // Tạo map ban đầu cho tất cả categories để dễ truy cập
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { id: cat.id, name: cat.name, children: [] });
  });

  // Xây dựng cây phân cấp
  categories.forEach((cat) => {
    const currentCategoryNode = categoryMap.get(cat.id);
    if (!currentCategoryNode) return; // Bỏ qua nếu không tìm thấy (lỗi dữ liệu?)

    if (cat.parentCategory && cat.level === 2) {
      // Nếu là category level 2, tìm cha (level 1) và thêm vào children của cha
      const parentNodeLevel1 = categoryMap.get(cat.parentCategory.id);
      if (parentNodeLevel1) {
        // Đảm bảo không thêm trùng lặp
        if (
          !parentNodeLevel1.children.some(
            (child) => child.id === currentCategoryNode.id
          )
        ) {
          parentNodeLevel1.children.push(currentCategoryNode);
        }
        // Thêm category level 1 vào megaMenuData nếu chưa có
        if (!megaMenuData[parentNodeLevel1.name]) {
          megaMenuData[parentNodeLevel1.name] = [];
        }
        // Đảm bảo category level 2 chỉ được thêm một lần vào root của level 1
        if (
          !megaMenuData[parentNodeLevel1.name].some(
            (child) => child.id === currentCategoryNode.id
          )
        ) {
          megaMenuData[parentNodeLevel1.name].push(currentCategoryNode);
        }
      }
    } else if (cat.parentCategory && cat.level === 3) {
      // Nếu là category level 3, tìm cha (level 2) và thêm vào children của cha
      const parentNodeLevel2 = categoryMap.get(cat.parentCategory.id);
      if (parentNodeLevel2) {
        // Đảm bảo không thêm trùng lặp
        if (
          !parentNodeLevel2.children.some(
            (child) => child.id === currentCategoryNode.id
          )
        ) {
          parentNodeLevel2.children.push(currentCategoryNode);
        }
      }
    } else if (cat.level === 1) {
      // Đảm bảo category level 1 tồn tại trong megaMenuData ngay cả khi không có con level 2
      if (!megaMenuData[currentCategoryNode.name]) {
        megaMenuData[currentCategoryNode.name] = [];
      }
    }
  });

  // Sắp xếp lại children trong mỗi category level 1 (nếu cần)
  for (const key in megaMenuData) {
    megaMenuData[key].sort((a, b) => a.name.localeCompare(b.name));
    megaMenuData[key].forEach((level2) => {
      level2.children.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  return megaMenuData;
};

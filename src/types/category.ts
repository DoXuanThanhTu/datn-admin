export type Category = {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  parentId?: string | null;
  order?: number;
  isActive: boolean;
  children?: Category[];
};

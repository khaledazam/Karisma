import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة تحكم كاريشما | إدارة المتجر والمنتجات والأقسام — نسرين الطنطاوي" },
      {
        name: "description",
        content:
          "لوحة التحكم المتكاملة لإدارة منتجات وأقسام كاريشما، تعديل الأسعار، الخصومات الفردية والجماعية، متابعة الطلبات وإضافات السلة.",
      },
    ],
  }),
  component: lazyRouteComponent(() => import("@/components/AdminPage"), "AdminPage"),
});

sap.ui.define(["sap/ui/core/format/DateFormat"], (DateFormat) => {
  "use strict";

  return {
    publishedYear(oDate) {
      if (!oDate) {
        return "";
      }
      const sYear = new Date(oDate).getFullYear();
      return this.getResourceBundle().getText("published", [sYear]);
    },

    formatDate(sDate) {
      if (!sDate) {
        return "";
      }
      return DateFormat.getDateInstance({ style: "medium" }).format(
        new Date(sDate),
      );
    },
  };
});

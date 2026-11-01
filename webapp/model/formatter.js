sap.ui.define([], () => {
  "use strict";

  return {
    publishedYear(oDate) {
      if (!oDate) {
        return "";
      }
      const sYear = new Date(oDate).getFullYear();
      const oBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();
      return oBundle.getText("published", [sYear]);
    },
  };
});

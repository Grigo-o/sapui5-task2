sap.ui.define(["./BaseController"], (BaseController) => {
  "use strict";

  return BaseController.extend("tasktwo.controller.Product", {
    onNavBack() {
      this.getRouter().navTo("RouteTab", { tabKey: "odataV2" });
    },
  });
});

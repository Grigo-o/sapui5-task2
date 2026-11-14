sap.ui.define(["./BaseController"], (BaseController) => {
  "use strict";

  return BaseController.extend("tasktwo.controller.Product", {
    onInit() {
      this.getRouter()
        .getRoute("RouteProduct")
        .attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched(oEvent) {
      const iProductId = parseInt(
        oEvent.getParameter("arguments").productId,
        10,
      );
      const oModel = this.getModel("odataV2Model");

      oModel.metadataLoaded().then(() => {
        const sPath = `/${oModel.createKey("Products", { ID: iProductId })}`;
        this.getView().bindElement({
          path: sPath,
          model: "odataV2Model",
          parameters: { expand: "Supplier" },
        });
      });
    },

    onNavBack() {
      this.getRouter().navTo("RouteTab", { tabKey: "odataV2" });
    },
  });
});

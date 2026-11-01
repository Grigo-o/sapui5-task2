sap.ui.define([
    "sap/ui/core/format/DateFormat"
], (DateFormat) => {
    "use strict";

    return {
        publishedYear(oDate) {
            if (!oDate) {
                return "";
            }
            const sYear = new Date(oDate).getFullYear();
            const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            return oBundle.getText("published", [sYear]);
        },

        formatDate(sDate) {
            if (!sDate) {
                return "";
            }
            return DateFormat.getDateInstance({ style: "medium" }).format(new Date(sDate));
        }
    };
});
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/type/Date"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("tasktwo.controller.Main", {
        onInit() {
            const oBookData = {
                books: [
                    { ID: "1", Name: "Dune", Author: "Frank Herbert", Genre: "Sci-Fi", ReleaseDate: new Date(1965, 7, 1), AvailableQuantity: 5 },
                    { ID: "2", Name: "1984", Author: "George Orwell", Genre: "Dystopian", ReleaseDate: new Date(1949, 5, 8), AvailableQuantity: 3 },
                    { ID: "3", Name: "The Hobbit", Author: "J.R.R. Tolkien", Genre: "Fantasy", ReleaseDate: new Date(1937, 8, 21), AvailableQuantity: 7 },
                    { ID: "4", Name: "Neuromancer", Author: "William Gibson", Genre: "Sci-Fi", ReleaseDate: new Date(1984, 6, 1), AvailableQuantity: 2 },
                    { ID: "5", Name: "Emma", Author: "Jane Austen", Genre: "Romance", ReleaseDate: new Date(1815, 11, 23), AvailableQuantity: 4 }
                ]
            };

            const oModel = new JSONModel(oBookData);
            this.getView().setModel(oModel);
        }
    });
});
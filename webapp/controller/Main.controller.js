sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/type/Date",
  ],
  (BaseController, JSONModel, Filter, FilterOperator, Fragment) => {
    "use strict";

    const FIELD_IDS = [
      "newId",
      "newName",
      "newAuthor",
      "newGenre",
      "newDate",
      "newQty",
    ];

    return BaseController.extend("tasktwo.controller.Main", {
      onInit() {
        const aBooks = [
          {
            ID: "1",
            Name: "Dune",
            Author: "Frank Herbert",
            Genre: "Sci-Fi",
            ReleaseDate: new Date(1965, 7, 1),
            AvailableQuantity: 5,
            editMode: false,
          },
          {
            ID: "2",
            Name: "1984",
            Author: "George Orwell",
            Genre: "Dystopian",
            ReleaseDate: new Date(1949, 5, 8),
            AvailableQuantity: 3,
            editMode: false,
          },
          {
            ID: "3",
            Name: "The Hobbit",
            Author: "J.R.R. Tolkien",
            Genre: "Fantasy",
            ReleaseDate: new Date(1937, 8, 21),
            AvailableQuantity: 7,
            editMode: false,
          },
          {
            ID: "4",
            Name: "Neuromancer",
            Author: "William Gibson",
            Genre: "Sci-Fi",
            ReleaseDate: new Date(1984, 6, 1),
            AvailableQuantity: 2,
            editMode: false,
          },
          {
            ID: "5",
            Name: "Emma",
            Author: "Jane Austen",
            Genre: "Romance",
            ReleaseDate: new Date(1815, 11, 23),
            AvailableQuantity: 4,
            editMode: false,
          },
        ];

        this.setModel(
          new JSONModel({ books: aBooks, genres: this._buildGenres(aBooks) }),
        );
        this.setModel(new JSONModel(this._getEmptyBook()), "newBook");
      },

      _getEmptyBook() {
        return {
          ID: "",
          Name: "",
          Author: "",
          Genre: "",
          ReleaseDate: null,
          AvailableQuantity: "",
        };
      },

      _buildGenres(aBooks) {
        const aGenres = [
          ...new Set(aBooks.map((oBook) => oBook.Genre).filter(Boolean)),
        ].map((sGenre) => ({ key: sGenre, text: sGenre }));
        aGenres.unshift({ key: "", text: "All" });
        return aGenres;
      },

      onAddRecord() {
        if (!this._pAddDialog) {
          this._pAddDialog = Fragment.load({
            id: this.getView().getId(),
            name: "tasktwo.view.fragments.AddBookDialog",
            controller: this,
          }).then((oDialog) => {
            this.getView().addDependent(oDialog);
            return oDialog;
          });
        }
        this._pAddDialog.then((oDialog) => {
          this.getModel("newBook").setData(this._getEmptyBook());
          this._resetValueStates();
          oDialog.open();
        });
      },

      onConfirmAdd() {
        if (!this._validateNewBook()) {
          return;
        }

        const oNew = this.getModel("newBook").getData();
        const oModel = this.getModel();
        const aBooks = oModel.getProperty("/books");

        aBooks.push({
          ID: oNew.ID.trim(),
          Name: oNew.Name.trim(),
          Author: oNew.Author.trim(),
          Genre: oNew.Genre.trim(),
          ReleaseDate: oNew.ReleaseDate,
          AvailableQuantity: Number(oNew.AvailableQuantity),
          editMode: false,
        });
        oModel.setProperty("/books", aBooks);
        oModel.setProperty("/genres", this._buildGenres(aBooks));
        this._closeAddDialog();
      },

      onCancelAdd() {
        this._closeAddDialog();
      },

      _closeAddDialog() {
        this._pAddDialog.then((oDialog) => oDialog.close());
      },

      _validateNewBook() {
        const oData = this.getModel("newBook").getData();
        const mValid = {
          newId: String(oData.ID).trim() !== "",
          newName: String(oData.Name).trim() !== "",
          newAuthor: String(oData.Author).trim() !== "",
          newGenre: String(oData.Genre).trim() !== "",
          newDate: !!oData.ReleaseDate,
          newQty:
            String(oData.AvailableQuantity).trim() !== "" &&
            Number(oData.AvailableQuantity) >= 0,
        };

        let bValid = true;
        FIELD_IDS.forEach((sId) => {
          const oControl = this.byId(sId);
          if (mValid[sId]) {
            oControl.setValueState("None");
          } else {
            oControl.setValueState("Error");
            bValid = false;
          }
        });
        return bValid;
      },

      _resetValueStates() {
        FIELD_IDS.forEach((sId) => this.byId(sId).setValueState("None"));
      },

      onDeleteRecord() {
        if (!this._pDeleteDialog) {
          this._pDeleteDialog = Fragment.load({
            id: this.getView().getId(),
            name: "tasktwo.view.fragments.DeleteDialog",
            controller: this,
          }).then((oDialog) => {
            this.getView().addDependent(oDialog);
            return oDialog;
          });
        }
        this._pDeleteDialog.then((oDialog) => oDialog.open());
      },

      onConfirmDelete() {
        const oTable = this.byId("booksTable");
        const oModel = this.getModel();
        const aBooks = oModel.getProperty("/books");

        oTable
          .getSelectedContextPaths()
          .map((sPath) => parseInt(sPath.split("/").pop(), 10))
          .sort((a, b) => b - a)
          .forEach((iIndex) => aBooks.splice(iIndex, 1));

        oModel.setProperty("/books", aBooks);
        oTable.removeSelections(true);
        this._closeDeleteDialog();
      },

      onCancelDelete() {
        this._closeDeleteDialog();
      },

      _closeDeleteDialog() {
        this._pDeleteDialog.then((oDialog) => oDialog.close());
      },

      onFilter() {
        const sName = this.byId("nameFilter").getValue();
        const sGenre = this.byId("genreFilter").getSelectedKey();
        const aFilters = [];

        if (sName) {
          aFilters.push(new Filter("Name", FilterOperator.Contains, sName));
        }
        if (sGenre) {
          aFilters.push(new Filter("Genre", FilterOperator.EQ, sGenre));
        }

        this.byId("booksTable").getBinding("items").filter(aFilters);
      },

      onEditTitle(oEvent) {
        this._setEditMode(oEvent, true);
      },

      onSaveTitle(oEvent) {
        this._setEditMode(oEvent, false);
      },

      _setEditMode(oEvent, bEdit) {
        const oContext = oEvent.getSource().getBindingContext();
        this.getModel().setProperty(`${oContext.getPath()}/editMode`, bEdit);
      },
    });
  },
);

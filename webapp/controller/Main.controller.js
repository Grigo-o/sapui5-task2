sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/type/Date",
  ],
  (
    BaseController,
    formatter,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
  ) => {
    "use strict";

    const FIELD_IDS = [
      "newId",
      "newName",
      "newAuthor",
      "newGenre",
      "newDate",
      "newQty",
    ];

    const PRODUCT_FIELD_IDS = [
      "prodId",
      "prodName",
      "prodDesc",
      "prodRelease",
      "prodDiscontinued",
      "prodRating",
      "prodPrice",
    ];

    return BaseController.extend("tasktwo.controller.Main", {
      formatter: formatter,

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
        this.setModel(new JSONModel(this._getEmptyProduct()), "newProduct");
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
        aGenres.unshift({
          key: "",
          text: this.getResourceBundle().getText("all"),
        });
        return aGenres;
      },

      onAddRecord() {
        if (!this._pAddDialog) {
          this._pAddDialog = this.loadFragment({
            name: "tasktwo.view.fragments.AddBookDialog",
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
          ID: String(oNew.ID).trim(),
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

      onSelectionChange() {
        this._updateDeleteButton();
      },

      _updateDeleteButton() {
        const bHasSelection =
          this.byId("booksTable").getSelectedItems().length > 0;
        this.byId("deleteBtn").setEnabled(bHasSelection);
      },

      onDeleteRecord() {
        if (!this._pDeleteDialog) {
          this._pDeleteDialog = this.loadFragment({
            name: "tasktwo.view.fragments.DeleteDialog",
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
        this._updateDeleteButton();
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

      _getEmptyProduct() {
        return {
          ID: "",
          Name: "",
          Description: "",
          ReleaseDate: null,
          DiscontinuedDate: null,
          Rating: "",
          Price: "",
        };
      },

      onAddV2() {
        if (!this._pAddProductDialog) {
          this._pAddProductDialog = this.loadFragment({
            name: "tasktwo.view.fragments.AddProductDialog",
          });
        }
        this._pAddProductDialog.then((oDialog) => {
          this.getModel("newProduct").setData(this._getEmptyProduct());
          PRODUCT_FIELD_IDS.forEach((sId) => this.byId(sId).setValueState("None"));
          oDialog.open();
        });
      },

      onCancelV2() {
        this._closeAddProductDialog();
      },

      _closeAddProductDialog() {
        this._pAddProductDialog.then((oDialog) => oDialog.close());
      },

      onProductFieldChange(oEvent) {
        const oControl = oEvent.getSource();
        const vValue = oControl.isA("sap.m.DatePicker")
          ? oControl.getDateValue()
          : oControl.getValue().trim();
        oControl.setValueState(vValue ? "None" : "Error");
      },

      _validateNewProduct() {
        const oData = this.getModel("newProduct").getData();
        const mValid = {
          prodId: String(oData.ID).trim() !== "",
          prodName: String(oData.Name).trim() !== "",
          prodDesc: String(oData.Description).trim() !== "",
          prodRelease: !!oData.ReleaseDate,
          prodDiscontinued: !!oData.DiscontinuedDate,
          prodRating: String(oData.Rating).trim() !== "",
          prodPrice: String(oData.Price).trim() !== "",
        };

        let bValid = true;
        PRODUCT_FIELD_IDS.forEach((sId) => {
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

      onSaveV2() {
        if (!this._validateNewProduct()) {
          return;
        }

        const oData = this.getModel("newProduct").getData();
        const oModel = this.getModel("odataV2Model");
        const oBundle = this.getResourceBundle();
        const sGroupId = "createProduct";

        if (!oModel.getDeferredGroups().includes(sGroupId)) {
          oModel.setDeferredGroups(oModel.getDeferredGroups().concat(sGroupId));
        }

        oModel.create(
          "/Products",
          {
            ID: parseInt(oData.ID, 10),
            Name: oData.Name.trim(),
            Description: oData.Description.trim(),
            ReleaseDate: oData.ReleaseDate,
            DiscontinuedDate: oData.DiscontinuedDate,
            Rating: parseInt(oData.Rating, 10),
            Price: String(oData.Price),
          },
          {
            groupId: sGroupId,
            success: () => {
              MessageToast.show(oBundle.getText("createSuccess"));
              this._closeAddProductDialog();
            },
            error: () => {
              MessageBox.error(oBundle.getText("createError"));
            },
          },
        );
        oModel.submitChanges({ groupId: sGroupId });
      },

      onV2SelectionChange() {
        this._updateDeleteV2Button();
      },

      _updateDeleteV2Button() {
        const bHasSelection =
          this.byId("productsV2Table").getSelectedItems().length > 0;
        this.byId("deleteV2Btn").setEnabled(bHasSelection);
      },

      onDeleteV2() {
        const oTable = this.byId("productsV2Table");
        const oModel = this.getModel("odataV2Model");
        const oBundle = this.getResourceBundle();
        const sGroupId = "deleteProducts";

        const aPaths = oTable
          .getSelectedItems()
          .map((oItem) => oItem.getBindingContext("odataV2Model").getPath());

        if (!oModel.getDeferredGroups().includes(sGroupId)) {
          oModel.setDeferredGroups(oModel.getDeferredGroups().concat(sGroupId));
        }

        const aRequests = aPaths.map(
          (sPath) =>
            new Promise((resolve) => {
              oModel.remove(sPath, {
                groupId: sGroupId,
                success: () => resolve(true),
                error: () => resolve(false),
              });
            }),
        );

        oModel.submitChanges({ groupId: sGroupId });

        Promise.all(aRequests).then((aResults) => {
          const iDeleted = aResults.filter(Boolean).length;
          const iFailed = aResults.length - iDeleted;

          if (iDeleted > 0) {
            MessageToast.show(oBundle.getText("deleteSuccess", [iDeleted]));
          }
          if (iFailed > 0) {
            MessageBox.error(oBundle.getText("deleteError", [iFailed]));
          }

          oTable.removeSelections(true);
          this._updateDeleteV2Button();
        });
      },

      _setEditMode(oEvent, bEdit) {
        const oContext = oEvent.getSource().getBindingContext();
        this.getModel().setProperty(`${oContext.getPath()}/editMode`, bEdit);
      },
    });
  },
);

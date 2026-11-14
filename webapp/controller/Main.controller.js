sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
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
    Sorter,
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
        const oRouter = this.getRouter();
        oRouter
          .getRoute("RouteTab")
          .attachPatternMatched(this._onRouteTab, this);
      },

      onTabSelect(oEvent) {
        this.getRouter().navTo("RouteTab", {
          tabKey: oEvent.getParameter("key"),
        });
      },

      _onRouteTab(oEvent) {
        const sTabKey = oEvent.getParameter("arguments").tabKey;
        const oTabBar = this.byId("iconTabBar");
        const aKeys = oTabBar.getItems().map((oItem) => oItem.getKey());

        if (!aKeys.includes(sTabKey)) {
          this.getRouter().navTo("RouteTab", { tabKey: "json" }, true);
          return;
        }
        oTabBar.setSelectedKey(sTabKey);
      },

      onProductPress(oEvent) {
        const sProductId = oEvent
          .getSource()
          .getBindingContext("odataV2Model")
          .getProperty("ID");

        this.getRouter().navTo("RouteProduct", { productId: sProductId });
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

      onAddV2() {
        this._openProductDialog(true);
      },

      onEditV2(oEvent) {
        this._openProductDialog(
          false,
          oEvent.getSource().getBindingContext("odataV2Model"),
        );
      },

      _openProductDialog(bIsCreate, oEditContext) {
        const oModel = this.getModel("odataV2Model");
        const oBundle = this.getResourceBundle();

        const oContext = bIsCreate
          ? oModel.createEntry("/Products", {
              properties: {
                ID: null,
                Name: "",
                Description: "",
                ReleaseDate: null,
                DiscontinuedDate: null,
                Rating: null,
                Price: null,
              },
            })
          : oEditContext;

        if (!this._pAddProductDialog) {
          this._pAddProductDialog = this.loadFragment({
            name: "tasktwo.view.fragments.AddProductDialog",
          });
        }
        this._pAddProductDialog.then((oDialog) => {
          oDialog.setBindingContext(oContext, "odataV2Model");
          oDialog.setTitle(
            oBundle.getText(bIsCreate ? "addProductTitle" : "editProductTitle"),
          );
          this.byId("prodId").setEnabled(bIsCreate);
          PRODUCT_FIELD_IDS.forEach((sId) =>
            this.byId(sId).setValueState("None"),
          );
          oDialog.open();
        });
      },

      onCancelV2() {
        this._closeAddProductDialog();
      },

      _closeAddProductDialog() {
        this._pAddProductDialog.then((oDialog) => oDialog.close());
      },

      onAfterCloseProductDialog(oEvent) {
        const oModel = this.getModel("odataV2Model");
        const oContext = oEvent.getSource().getBindingContext("odataV2Model");

        if (!oContext || !oModel.hasPendingChanges()) {
          return;
        }
        if (oContext.isTransient()) {
          oModel.deleteCreatedEntry(oContext);
        } else {
          oModel.resetChanges([oContext.getPath()]);
        }
      },

      onProductFieldChange(oEvent) {
        this._validateControl(oEvent.getSource());
      },

      _validateControl(oControl) {
        let bValid = false;

        if (oControl.isA("sap.m.DatePicker")) {
          bValid = oControl.isValidValue() && oControl.getValue().length > 0;
        } else if (oControl.isA("sap.m.Input")) {
          const sValue = oControl.getValue().trim();
          bValid =
            oControl.getType() === "Number"
              ? Number(sValue) > 0
              : sValue.length > 0;
        }

        oControl.setValueState(bValid ? "None" : "Error");
        return bValid;
      },

      _validateProductForm() {
        return PRODUCT_FIELD_IDS.map((sId) =>
          this._validateControl(this.byId(sId)),
        ).every(Boolean);
      },

      onSaveV2() {
        if (!this._validateProductForm()) {
          return;
        }

        const oModel = this.getModel("odataV2Model");
        const oBundle = this.getResourceBundle();
        const oContext =
          this.byId("addProductDialog").getBindingContext("odataV2Model");
        const bCreate = !!oContext.isTransient();

        if (!oModel.hasPendingChanges()) {
          this._closeAddProductDialog();
          return;
        }

        oModel.submitChanges({
          success: () => {
            MessageToast.show(
              oBundle.getText(bCreate ? "createSuccess" : "updateSuccess"),
            );
            this._closeAddProductDialog();
          },
          error: () =>
            MessageBox.error(
              oBundle.getText(bCreate ? "createError" : "updateError"),
            ),
        });
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
        const oBundle = this.getResourceBundle();

        const aPaths = oTable
          .getSelectedItems()
          .map((oItem) => oItem.getBindingContext("odataV2Model").getPath());

        MessageBox.confirm(
          oBundle.getText("deleteProductsConfirm", [aPaths.length]),
          {
            title: oBundle.getText("confirmTitle"),
            actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.DELETE,
            onClose: (sAction) => {
              if (sAction === MessageBox.Action.DELETE) {
                this._deleteProducts(aPaths);
              }
            },
          },
        );
      },

      _deleteProducts(aPaths) {
        const oTable = this.byId("productsV2Table");
        const oModel = this.getModel("odataV2Model");
        const oBundle = this.getResourceBundle();

        aPaths.forEach((sPath) => oModel.remove(sPath, { groupId: "changes" }));

        oModel.submitChanges({
          groupId: "changes",
          success: () => {
            MessageToast.show(
              oBundle.getText("deleteSuccess", [aPaths.length]),
            );
            oTable.removeSelections(true);
            this._updateDeleteV2Button();
          },
          error: () => MessageBox.error(oBundle.getText("deleteError")),
        });
      },

      onFilterV2(oEvent) {
        const sValue = oEvent.getParameter("value").trim();
        const oTable = this.byId("productsV2Table");
        const aFilters = [];

        if (sValue) {
          aFilters.push(
            new Filter({
              path: "Name",
              operator: FilterOperator.Contains,
              value1: sValue,
              caseSensitive: false,
            }),
          );
        }

        oTable.removeSelections(true);
        this._updateDeleteV2Button();
        oTable.getBinding("items").filter(aFilters);
      },

      onSortV2(oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        const oBinding = this.byId("productsV2Table").getBinding("items");

        if (!oSelectedItem) {
          oBinding.sort([]);
          return;
        }

        oBinding.sort(new Sorter(oSelectedItem.getKey(), true));
      },

      _setEditMode(oEvent, bEdit) {
        const oContext = oEvent.getSource().getBindingContext();
        this.getModel().setProperty(`${oContext.getPath()}/editMode`, bEdit);
      },
    });
  },
);

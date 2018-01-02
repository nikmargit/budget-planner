let budgetController = (function() {
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(el => (sum += el.value));
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            let ID, newItem;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        calculateBudget: function() {
            //calc total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");

            //calculate the budget

            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round(
                    data.totals.exp / data.totals.inc * 100
                );
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };
})();

let UIController = (function() {
    let DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage"
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMStrings.inputValue).value
                )
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            if (type === "inc") {
                element = DOMStrings.incomeContainer;

                html =
                    '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMStrings.expensesContainer;

                html =
                    '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);

            document
                .querySelector(element)
                .insertAdjacentHTML("beforeend", newHtml);
        },

        clearFields: function() {
            let fields;

            fields = [
                ...document.querySelectorAll(
                    DOMStrings.inputDescription + "," + DOMStrings.inputValue
                )
            ];
            fields.forEach(field => (field.value = ""));
            fields[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent =
                obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent =
                obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent =
                obj.totalExp;
            document.querySelector(DOMStrings.percentageLabel).textContent =
                obj.percentage;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent =
                    obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent =
                    "---";
            }
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    };
})();

let controller = (function(budgetCtrl, UICtrl) {
    let setupEventListeners = function() {
        let DOM = UICtrl.getDOMStrings();

        document
            .querySelector(DOM.inputBtn)
            .addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function(e) {
            if (e.keyCode === 13) ctrlAddItem();
        });
    };

    let updateBudget = function() {
        //calculate the budget
        budgetController.calculateBudget();
        //return the budget
        let budget = budgetController.getBudget();
        //display the budget on the UI
        UIController.displayBudget(budget);
    };

    let ctrlAddItem = function() {
        // get input from the UI
        let input = UICtrl.getInput();

        if (
            input.description !== "" &&
            !isNaN(input.value) &&
            input.value > 0
        ) {
            // add input to the data structure
            let newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );
            //add element to the UI
            UIController.addListItem(newItem, input.type);
            //clear input fields
            UIController.clearFields();
            //calculate and display the budget
            updateBudget();
        }
    };

    return {
        init: function() {
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();

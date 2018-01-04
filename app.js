let budgetController = (function() {
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
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

        deleteItem: function(type, id) {
            let ids, index;

            ids = data.allItems[type].map(item => item.id);

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
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

        calculatePercentage: function() {
            data.allItems.exp.forEach(e => e.calcPercentage(data.totals.inc));
        },

        getPercentages: function() {
            var getPerc = data.allItems.exp.map(e => e.getPercentage());
            return getPerc;
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
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    let formatStrings = function(num, type) {
        let numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];

        if (int.length > 3) {
            int =
                int.substr(0, int.length - 3) +
                "," +
                int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    let nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
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
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMStrings.expensesContainer;

                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace(
                "%value%",
                formatStrings(obj.value, type)
            );

            document
                .querySelector(element)
                .insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function(selectorID) {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
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
            let type;
            obj.budget > 0 ? (type = "inc") : (type = "exp");

            document.querySelector(
                DOMStrings.budgetLabel
            ).textContent = formatStrings(obj.budget, type);
            document.querySelector(
                DOMStrings.incomeLabel
            ).textContent = formatStrings(obj.totalInc, "inc");
            document.querySelector(
                DOMStrings.expensesLabel
            ).textContent = formatStrings(obj.totalExp, "exp");
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

        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(
                DOMStrings.expensesPercLabel
            );

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },

        displayMonth: function() {
            let now, year, month, months;

            now = new Date();

            year = now.getFullYear();

            months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ];

            month = now.getMonth();

            document.querySelector(DOMStrings.dateLabel).textContent =
                months[month] + " " + year;
        },

        changeType: function() {
            let fields = document.querySelectorAll(
                DOMStrings.inputType +
                    "," +
                    DOMStrings.inputDescription +
                    "," +
                    DOMStrings.inputValue
            );

            nodeListForEach(fields, function(el) {
                el.classList.toggle("red-focus");
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
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

        document
            .querySelector(DOM.container)
            .addEventListener("click", ctrlDeleteItem);

        document
            .querySelector(DOM.inputType)
            .addEventListener("change", UICtrl.changeType);
    };

    let updateBudget = function() {
        //calculate the budget
        budgetController.calculateBudget();
        //return the budget
        let budget = budgetController.getBudget();
        //display the budget on the UI
        UIController.displayBudget(budget);
    };

    let updatePercentages = function() {
        // calc percentages
        budgetCtrl.calculatePercentage();

        // read the percentages from the budget controler
        let percentages = budgetCtrl.getPercentages();

        // update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
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
            //calculate and update the percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = function(event) {
        let itemID, splitItem, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitItem = itemID.split("-");
            type = splitItem[0];
            ID = Number(splitItem[1]);

            // 1 delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            // 2 delete item from UI
            UICtrl.deleteListItem(itemID);
            // 3 update the budget
            updateBudget();
            // 4 calculate and update the percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
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

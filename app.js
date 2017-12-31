let budgetController = (function() {
    let x = 25;
    function add(a) {
        return x + a;
    }
    return {
        publicTest: function(b) {
            return add(b);
        }
    };
})();

var UIController = (function() {
    //some code
})();

let controller = (function(budgetCtrl, UICtrl) {
    let ctrlAddItem = function() {
        console.log("works");
    };

    document.querySelector(".add__btn").addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(e) {
        if (e.keyCode === 13) ctrlAddItem();
    });
})(budgetController, UIController);

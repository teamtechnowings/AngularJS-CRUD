/**
 * Created by Thomas on 5/28/2015.
 */
var app = angular.module('expenseListApp', ["ngRoute"]);

app.config(function($routeProvider){
    $routeProvider
        .when("/",{
            templateUrl: "views/expenseList.html",
            controller: "HomeController"
        })
        .when("/inputItem",{
            templateUrl: "views/inputItem.html",
            controller: "ExpenseListItemController"
        })
        .when("/inputItem/edit/:id",{
            templateUrl: "views/inputItem.html",
            controller: "ExpenseListItemController"
        })
        .otherwise({
            redirectTo: "/"
        })
});

app.service("ExpenseService", function($http){

    var expenseService = {};

    expenseService.expenseItems = [];

    $http.get("json/server_data.json")
        .success(function(data){
            expenseService.expenseItems = data;

            for(var item in expenseService.expenseItems){
                expenseService.expenseItems[item].date = new Date(expenseService.expenseItems[item].date);
            }
        })
        .error(function(data,status){
            alert("Something Went Wrong!");
        })

    expenseService.findById = function(id){
        for(var item in expenseService.expenseItems){
            if(expenseService.expenseItems[item].id == id)
            return expenseService.expenseItems[item];
        }
    };

    expenseService.markChecked = function(entry){
        entry.checked = !entry.checked;
    };

    expenseService.checkChecked = function(){

        console.log("expenseService checkChecked");
        var count = 0, it = 0;
        for(var item in expenseService.expenseItems){
            if(expenseService.expenseItems[item].checked == true){
            it = expenseService.expenseItems[item].id;
            count++;
            }
        }
        if(count > 1){
        alert("Can't Edit More than one item at a time!");
        return -1;
         }else if(count == 0){
         alert("Please Select one item to edit!");
         return 0;
         }
        else
        return it;
        //$http.post("#/inputItem/edit/" + it);
    };

    expenseService.toDelete = function(){

        // var list= [];
        // console.log("inside toDelete!");
        // for(var item in expenseService.expenseItems){
        //     if(expenseService.expenseItems[item].checked == true){
        //         list.push(expenseService.expenseItems[item].id);
        //         console.log(" getting Ids: " + expenseService.expenseItems[item].id);
        //     }
        // }

        // for(var ids in list){
        //     //var index = expenseService.expenseItems.indexOf(list.ids);
        //     expenseService.expenseItems.splice(list[ids]-1,1);
        //     console.log(" list[ids]: " + list[ids]);
        //     console.log(expenseService.expenseItems);
        // }

        alert("items Deleted!");    

    };

    expenseService.removeItem = function(entry){

        $http.get("json/delete_item.json", {id: entry.id})
            .success(function(data){

                if(data.status){
                    var index = expenseService.expenseItems.indexOf(entry);
                    expenseService.expenseItems.splice(index, 1);
                }

            })
            .error(function(data, status){

            });

    };

    expenseService.save = function(entry){

        var updateItem = expenseService.findById(entry.id);

        if(updateItem){

            $http.get("json/updated_item.json", entry)
                .success(function(data){

                    if(data.status == 1){

                        updateItem.expense = entry.expense;
                        updateItem.itemName = entry.itemName;
                        updateItem.date = entry.date;

                    }

                })
                .error(function(data, status){


                });

        }else{

            $http.get("json/added_item.json", entry)
                .success(function(data){
                    entry.id = data.newId;
                })
                .error(function(data, status){
                    
                });

            expenseService.expenseItems.push(entry);

        }
    };

    return expenseService;

});

app.controller("HomeController", ["$scope", "ExpenseService", "$location", function($scope, ExpenseService, $location) {
    
    $scope.expenseItems = ExpenseService.expenseItems;

    $scope.removeItem = function(entry){
        ExpenseService.removeItem(entry);
    }

    $scope.markChecked = function(entry){
        ExpenseService.markChecked(entry);
    };
    
    $scope.checkChecked = function(){
        console.log("HomeController checkChecked");
        var it = ExpenseService.checkChecked();
        if(it==-1 || it==0){

        }else{
            $location.path("/inputItem/edit/" + it);
        }
    };

    // $scope.toDelete = function(){
    //     ExpenseService.toDelete();
    // };
   
    $scope.$watch(function(){return ExpenseService.expenseItems;}, function(expenseItems){
        $scope.expenseItems = expenseItems;
    });

}]);


app.controller("ExpenseListItemController",  ["$scope", "$routeParams", "$location", "$window", "ExpenseService", function($scope, $routeParams, $location, $window, ExpenseService){

    if(!$routeParams.id){
        $scope.expenseItem = { id:0, expense: "", itemName: "", date: new Date() };
    }else{
        $scope.expenseItem = _.clone(ExpenseService.findById(parseInt($routeParams.id)));
    }

    $scope.save = function(){
        ExpenseService.save($scope.expenseItem);
        $location.path("/");
    };

    //console.log($scope.expenseItems);

}]);

app.directive("tbExpenseItem", function(){
    return{
        restrict: "E",
        templateUrl: "views/expenseItem.html"
    }
});
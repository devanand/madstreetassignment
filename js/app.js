/*global angular*/
var app = angular.module("app", ['ngRoute']);
 
app.controller('shopController', function($scope, $http) {
    $scope.allItems = [];
    $scope.allItemsMap = {};
    $scope.itemCategories = [];
    $scope.currentPage = 0;
    $scope.pageSize = 9;
    $scope.selectedItems = [];
    $scope.selectedItemCategories = [];
    $scope.init = function() {
     $http.jsonp("js/data.json?callback=JSON_CALLBACK")
        .success(function(data){
            $scope.allItems = data.products;
            $scope.indexData(); 
            $scope.selectedItems = $scope.allItems;
        });
    };
    
    $scope.init();
    
    /*indexing data by types*/
    $scope.indexData = function() {
        var max=0;
        for(var i=0;i<$scope.allItems.length;i++) {
            if($scope.allItems[i].price>max) {
                max = $scope.allItems[i].price;
            }
            if($scope.allItemsMap[$scope.allItems[i].cat] == null || $scope.allItemsMap[$scope.allItems[i].cat] == undefined) {
                $scope.allItemsMap[$scope.allItems[i].cat] = new Array($scope.allItems[i]);
            } else {
                var temp = $scope.allItemsMap[$scope.allItems[i].cat];
                temp[temp.length] = $scope.allItems[i];
                $scope.allItemsMap[$scope.allItems[i].cat] = temp;
            }
            
        }
       
        for(var key in $scope.allItemsMap) {
            if($scope.allItemsMap.hasOwnProperty(key)) {
                $scope.itemCategories.push(key);
            }
        }
        
        $scope.init_slider(max);
        $("#minPrice").val(0);
        $("#maxPrice").val(max);
    },
    
    /*initialize slider*/
    $scope.init_slider = function(max) {
      $(".price_slider").slider({
          range: true,
          min: 0,
          max: max,
          values: [0, max],
          
          slide: function(event, ui) {
              $("#amount").val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
              $("#minPrice").val(ui.values[0]);
              $("#maxPrice").val(ui.values[1]);
          },
          stop: function(event, ui) {
              $scope.filterProducts();
              $scope.$apply();
          }
      });
    
      $("#amount").val("$" + $(".price_slider").slider("values", 0) +
      " - $" + $(".price_slider").slider("values", 1));
    },
    
    /*Filter using price and category*/
    $scope.filterProducts=function() {
        var minPrice = $("#minPrice").val();
        var maxPrice = $("#maxPrice").val();
        var selectedCategories = $scope.selectedItemCategories;
        
        var selectedItems = [];
        var selectedFirst = [];
        
        if(selectedCategories.length == 0) {
            selectedFirst = $scope.allItems;
        } else {
            for(var i=0;i<selectedCategories.length;i++) {
                var temp = $scope.allItemsMap[selectedCategories[i]];
                Array.prototype.push.apply(selectedFirst, temp);
            }
        }
        
        for(var i=0;i<selectedFirst.length;i++) {
            if(selectedFirst[i].price >= minPrice && selectedFirst[i].price<=maxPrice) {
                selectedItems.push(selectedFirst[i]);
            }
        }
        $scope.selectedItems = selectedItems;
        
    }
        
    /* Paginate the data*/
    $scope.numberOfPages=function(){
        return Math.ceil($scope.selectedItems.length/$scope.pageSize);                
    },
        
    /*click event for left menu item*/
    $scope.left_menu_item = function($event) {
        var target = $event.currentTarget;
        if(target.className.search("selected") == -1) {
            var temp =target.className.replace("left_menu_item ng-scope", "").trim();
            if($scope.selectedItemCategories.length == 0) {
                $scope.selectedItemCategories = new Array(temp);
            } else {
                $scope.selectedItemCategories[$scope.selectedItemCategories.length] = temp;
            }
            
            target.className = target.classList.value+" selected";
            target.style.background="url(images/checked.png) no-repeat left #dad0d0";
            target.style.backgroundPosition="5px 5px";
        } else {
            target.className = target.className.replace("selected", "").trim();
            target.style.background="";
            target.style.backgroundPosition="";
            var temp =target.className.replace("left_menu_item ng-scope", "").trim();
            var index = $scope.selectedItemCategories.indexOf(temp);
            if($scope.selectedItemCategories.length != 0 && index != -1) {
                $scope.selectedItemCategories.splice(index, 1);
            }
            
        }
        
        $scope.filterProducts();
    },
    
    
    $scope.sortScore = function() {
        $scope.selectedItems.sort(sort_by("score", true, parseInt));
    }
    
    $scope.sortPrice = function() {
        $scope.selectedItems.sort(sort_by("price", false, parseInt));
    }
    
    var sort_by = function(field, reverse, primer){

       var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

       reverse = !reverse ? 1 : -1;

       return function (a, b) {
          return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
       } 
   }
});

app.filter('startFrom', function() {
    return function(input, start) {
        
        start = +start; //parse to int
        return input.slice(start);
    }
});

app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

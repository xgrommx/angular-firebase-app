(function($, ng) {
    var app = ng.module('app', ['firebase'])
        .constant({fireBaseUrl: 'https://yourname.firebaseio.com/users'})
        .controller('MainCtrl', ['$scope', '$log', 'fireBaseUrl', 'angularFire', 'filterFilter', function($scope, $log, fireBaseUrl, angularFire, filterFilter) {
            Enumerable.Utils.extendTo(Array);
            var emptyUser = {
                name: '',
                age: '',
                salary: '',
                jobTitle: ''
            };

            $scope.users = [];
            $scope.isUpdate = false;
            $scope.newUser = emptyUser;
            $scope.nestedSort = [];
            $scope.sortByJobTitleDescending = false;

            var promise = angularFire(new Firebase(fireBaseUrl), $scope, 'users');

            promise.then(function() {
                /**
                 *
                 */
                $scope.$watchCollection('users', function(newUsers, oldUsers) {
                    $scope.groups = newUsers.groupBy(
                        // TKey, equivalent in .net user => user.jobTitle
                        function(user) {
                            return user.jobTitle;
                        },
                        // TElement, equivalent in .net user => new {salary: user.salary, name: user.name, age: user.age}
                        function(user) {
                            return {
                                salary: user.salary,
                                name: user.name,
                                age: user.age,
                                jobTitle: user.jobTitle,
                                // This index need for update and remove user
                                index: newUsers.indexOf(user)
                            }
                        },
                        // TResult, equivalent in .net (jobTitle, userEnumerable) => new {jobTitle: jobTitle, user: userEnumerable.ToArray()}
                        function(jobTitle, userEnumerable) {
                            return {
                                jobTitle: jobTitle,
                                users: userEnumerable.orderBy(function(user) {
                                    return user.name;
                                }).toArray()
                            }
                        }
                    ).doAction(function(value,index) {
                            $scope.nestedSort[index] = {
                                descending: false
                            };
                    }).toArray();
                });

                /**
                 * Set value for nested sort
                 * @param field
                 * @param index
                 */
                $scope.setNestedSort = function(field, index) {
                    $scope.nestedSort[index] = {
                        field: field,
                        descending: typeof $scope.nestedSort[index] === 'undefined' ? false : !$scope.nestedSort[index].descending
                    };
                };

                /**
                 *
                 * @param name
                 * @param index
                 * @returns {*}
                 */
                $scope.getClassByName = function(name, index) {
                  if($scope.nestedSort[index].field == name) {
                      return {
                          'glyphicon-sort-by-alphabet-alt': $scope.nestedSort[index].descending,
                          'glyphicon-sort-by-alphabet': !$scope.nestedSort[index].descending
                      };
                  } else {
                      return 'glyphicon-sort-by-alphabet';
                  }
                };

                /**
                 *
                 * @param user
                 */
                $scope.addNewUser = function(user) {
                    if($scope.isUpdate) {
                        if (angular.equals(user, $scope.originalUser) == false) {
                            $scope.users.splice($scope.originalUser.index, 1, {
                                name: user.name,
                                age: user.age,
                                salary: user.salary,
                                jobTitle: user.jobTitle
                            });
                        }
                        $scope.originalUser = null;
                        $scope.newUser = emptyUser;
                        $scope.isUpdate = false;
                    } else {
                        $scope.users.push(user);
                    }
                };

                $scope.undoUser = function() {
                    if($scope.isUpdate) {
                        $scope.users[$scope.originalUser.index] = {
                            name: $scope.originalUser.name,
                            age: $scope.originalUser.age,
                            jobTitle: $scope.originalUser.jobTitle,
                            salary: $scope.originalUser.salary
                        };
                    }
                    $scope.originalUser = null;
                    $scope.newUser = emptyUser;
                    $scope.isUpdate = false;
                };

                $scope.removeUser = function(index) {
                    $scope.users.splice(index, 1);
                };

                /**
                 *
                 * @param user
                 */
                $scope.editUser = function(user) {
                    $scope.newUser = user;
                    $scope.originalUser = angular.extend({}, user);
                    $scope.isUpdate = true;
                };
            });
        }]);
})(jQuery, angular);
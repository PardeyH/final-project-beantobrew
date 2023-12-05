# Welcome to *bean-to-brew*

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.0.
## ⭐️ How to adapt this template
- If the repo name changes - account for this in `package.json/build` step (to change base-ref for routing)
- Current url: https://bean-to-brew.bulbt.com

- Or use the following bash script
```bash
brew install gnu-sed
# Frontend 
grep -ilr "bean-to-brew" .| grep -v "docs/" | grep -v ".gitignore"| grep -v "package-lock.json" | grep -v ".angular/" | grep -v ".node_modules/" | grep -v ".git/" | grep -v ".idea/" | xargs gsed -i s/bean-to-brew/bean-to-brew/g
 
# Backend
grep -ilr "api-bean-to-brew" .| grep -v "docs/" | grep -v ".gitignore"| grep -v "package-lock.json" | grep -v ".angular/" | grep -v ".node_modules/" | grep -v ".git/" | grep -v ".idea/" | xargs gsed -i s/api-bean-to-brew/api-bean-to-brew/g
```


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

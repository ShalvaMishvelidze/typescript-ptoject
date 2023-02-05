/// <reference path="./models/drag-drop.ts"/>
/// <reference path="./models/project.ts"/>
/// <reference path="./state/project.ts"/>
/// <reference path="./utils/validation.ts"/>
/// <reference path="./decorators/autobind.ts"/>
/// <reference path="./components/base.ts"/>
/// <reference path="./components/item.ts"/>
/// <reference path="./components/list.ts"/>
/// <reference path="./components/input.ts"/>

namespace App {
  new ProjectInput();
  new ProjectList('active');
  new ProjectList('finished');
}

import { Component } from './base.js';
import { Validatable, validate } from '../utils/validation.js';
import { AutoBind } from '../decorators/autobind.js';
import { projectState } from '../state/project.js';

// ProjectInput class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleDOM: HTMLInputElement;
  descriptionDOM: HTMLInputElement;
  peopleDOM: HTMLInputElement;
  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleDOM = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionDOM = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleDOM = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent(): void {}

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleDOM.value;
    const enteredDescription = this.descriptionDOM.value;
    const enteredPeople = +this.peopleDOM.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('invalid input, please try again');
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleDOM.value = '';
    this.descriptionDOM.value = '';
    this.peopleDOM.value = '';
  }

  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }
}

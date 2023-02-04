// drag and drop interfaces
interface Draggable {
  dragStartHandler(e: DragEvent): void;
  dragEndHandler(e: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(e: DragEvent): void;
  dropHandler(e: DragEvent): void;
  dragLeaveHandler(e: DragEvent): void;
}

// project type
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// project state management

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLenght?: number;
  min?: number;
  max?: number;
}

function validate(validatable: Validatable) {
  let isValid = true;
  if (validatable.required) {
    isValid = isValid && validatable.value.toString().trim().length !== 0;
  }
  if (validatable.minLength != null && typeof validatable.value === 'string') {
    isValid = isValid && validatable.value.length > validatable.minLength;
  }
  if (validatable.maxLenght != null && typeof validatable.value === 'string') {
    isValid = isValid && validatable.value.length < validatable.maxLenght;
  }
  if (validatable.min != null && typeof validatable.value === 'number') {
    isValid = isValid && validatable.value >= validatable.min;
  }
  if (validatable.max != null && typeof validatable.value === 'number') {
    isValid = isValid && validatable.value <= validatable.max;
  }
  return isValid;
}

// autobind decorator
function AutoBind(_: any, _2: string | symbol, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// component base class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById(templateId)!
    );
    this.hostElement = <T>document.getElementById(hostElementId)!;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = `${newElementId}`;
    }

    this.attach(insertAtStart);
  }
  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// ProjectItem class

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get people() {
    if (this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} people`;
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragStartHandler(e: DragEvent): void {
    e.dataTransfer!.setData('text/plain', this.project.id);
    e.dataTransfer!.effectAllowed = 'move';
  }

  @AutoBind
  dragEndHandler(e: DragEvent): void {
    console.log('drag end');
  }

  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }
  renderContent(): void {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.people + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

// ProjectList class

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);

    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragOverHandler(e: DragEvent): void {
    if (e.dataTransfer && e.dataTransfer.types[0] === 'text/plain') {
      e.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }

  @AutoBind
  dropHandler(e: DragEvent): void {
    const prjId = e.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      prjId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @AutoBind
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  configure(): void {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if (this.type === 'active') {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }
}

// ProjectInput class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');

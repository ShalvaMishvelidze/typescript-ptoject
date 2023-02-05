/// <reference path="./base.ts"/>

// ProjectItem class
namespace App {
  export class ProjectItem
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
}

interface projectStatus{
	dontWork: "dontWork",
	atWork: "atWork",
	ready: "ready",
	test: "test",
	completed: "completed"
}
interface projectBase{
	items: string;
	level:	number;
	status: string;
}

class Project{
	items: string;
	level:	number;
	status: string;
	daysInOperation: number=0;
	daysInTest: number=0;
	numberOfDevelopersEmployed: number=0;
	workingProgrammers: Programmer[] = [];
	constructor(options: {
			items: string; 
			level:	number;
			status: string;
		}) {
		this.items = options.items;
		this.level = options.level;
		this.status = options.status;
	}

	changedaysInOperation():void {
		this.daysInOperation += 1;
	}
}

class Programmer {
	position:'web' | 'mobile' | 'qa';
	numberOfProject: number;
	constructor(position: 'web' | 'mobile' | 'qa', numberOfProject: number = 0) {
		this.position = position;
		this.numberOfProject = numberOfProject;
	}
	daysDontWork:number = 0;
	statusWork:'free' | "busy" = 'free';
	isWorker: boolean = true;
}



class Company {
	projectList: 				Project[] = [];
	projectListForTest: 		Project[]=[];
	programmerList: 			Programmer[]=[];
	listOfCompletedProjects: 	Project[]=[];
	listOfDelProgrammer: 		Programmer[]=[];
	listOfDepartments: 			{webDep: Department, mobileDep: Department, qaDep: Department } ={
		webDep: null!,
		mobileDep: null!,
		qaDep: null!
	};
	listAllProgrammerInDep: 	Programmer[]=[];
	listAllProgrammer: 			Programmer[]=[];

	projectStatus: projectStatus = {
		dontWork: "dontWork",
		atWork: "atWork",
		ready: "ready",
		test: "test",
		completed: "completed"
	};
	itemsProject:string[] = ['web', 'mobile'];


	positionProgrammer: {Web: 'web', Mobile: 'mobile',QA: 'qa'}={
		Web: 'web',
		Mobile: 'mobile',
		QA: 'qa'};

	statusWorkForProgrammer: {free: 'free', busy: 'busy'} = {
		busy: 'busy',
		free: 'free'
	};


	getRandomInt(min: number, max: number):number {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
	}

	getFreeProgrammer() {
		return this.programmerList.filter(e => e.statusWork === this.statusWorkForProgrammer.free)
	}

	getAllProgrammerInDeprtments() {
		this.listAllProgrammerInDep = []
		Object.entries(this.listOfDepartments).forEach(e => {
			e[1].programmerList.forEach(p => this.listAllProgrammerInDep.push(p))
		});
	}
	getAllProgrammer() {
		this.getAllProgrammerInDeprtments()
		this.listAllProgrammerInDep.forEach(e => this.listAllProgrammer.push(e))
		this.listOfDelProgrammer.forEach(e => this.listAllProgrammer.push(e))
	}

}

class Department extends Company {
	_name: string;
	constructor(name:string) {
		super();
		this._name = name;
	}

	getName():string {
		return this._name;
	}

	addProgrammer(programmer: Programmer) {
		this.programmerList.push(programmer)
	}
}




class Boss extends Company {
	private static instance: Boss;
	constructor() {
		super();
		this.listOfDepartments.webDep = (new Department('Web'));
		this.listOfDepartments.mobileDep = (new Department('Mobile'));
		this.listOfDepartments.qaDep = (new Department('QA'));
	}
	    static getInstance() {
        if (!Boss.instance) {
            Boss.instance = new Boss();
            // ... здесь единожды выполняется инициализация ...
        }
        return Boss.instance;
    }

	addProgrammer() {
		if (this.projectList.length > 0) {
			for (let i = 0; i < this.projectList.filter(e => e.items == this.positionProgrammer.Web).length; i++) {
				this.listOfDepartments.webDep.addProgrammer(new Programmer(this.positionProgrammer.Web));
			}
			for (let i = 0; i < this.projectList.filter(e => e.items == this.positionProgrammer.Mobile).length; i++) {
				this.listOfDepartments.mobileDep.addProgrammer(new Programmer(this.positionProgrammer.Mobile));
			}
			for (let i = 0; i < this.projectListForTest.filter(e => e.status == this.projectStatus.ready).length; i++) {
				this.listOfDepartments.qaDep.addProgrammer(new Programmer(this.positionProgrammer.QA));
			}
		}
	}

	addProject() {
		let numberOfProject = this.getRandomInt(0, 5);
		if (numberOfProject != 0) {
			for (let i = 0; i < numberOfProject; i++) {
				let project: projectBase={
					items: '',
					level: 0,
					status: ''
				}
				project.items = this.itemsProject[Math.floor(Math.random() * this.itemsProject.length)];
				project.level = this.getRandomInt(1, 4);
				project.status = this.projectStatus.dontWork;
				this.projectList.push(new Project(project));
			};
		};
	};

	giveProjectsToDevelopers() {
		const changeInformationProjectAtWork = (mobProject: Project[], freeProgrammer: Programmer[]) => {
			mobProject.forEach((e, index) => {
				if (freeProgrammer.length > 0) {
					e.numberOfDevelopersEmployed += 1;
					e.workingProgrammers.push(freeProgrammer[0])
					e.workingProgrammers.forEach(p => {

						p.statusWork = this.statusWorkForProgrammer.busy;
						p.numberOfProject += 1;
						p.daysDontWork = 0;
					})
					freeProgrammer.splice(index, 1)
				}
			})


		}

		const changeInformation = (typeProject: Project[], dep: Department, freeProgrammer: Programmer[]) => {
			if (typeProject.length > 0) {
				typeProject.forEach((e) => {
					freeProgrammer = dep.getFreeProgrammer();
					if (freeProgrammer.length > 0) {
						e.status = this.projectStatus.atWork;
						e.numberOfDevelopersEmployed += 1;
						e.workingProgrammers.push(freeProgrammer[0])
						dep.projectList.push(e)
						e.workingProgrammers.forEach(p => {
							p.statusWork = this.statusWorkForProgrammer.busy;
							p.numberOfProject += 1;
							p.daysDontWork = 0;
						})
					}
				});
			};
		}
		if (this.projectList.length > 0) {
			const change = changeInformation.bind(this);
			const changeProjectInf = changeInformationProjectAtWork.bind(this)
			let webProjects = this.projectList.filter(e => e.items == this.itemsProject[0] && e.status === this.projectStatus.dontWork);
			let webProgrammer = this.listOfDepartments.webDep.getFreeProgrammer().filter(e => e.position === this.positionProgrammer.Web);

			let mobileProjects = this.projectList.filter(e => e.items === this.itemsProject[1] && e.status === this.projectStatus.dontWork);
			let mobileProgrammer = this.listOfDepartments.mobileDep.getFreeProgrammer().filter(e => e.position === this.positionProgrammer.Mobile);
			if (webProjects.length > 0) {
				change(webProjects, this.listOfDepartments.webDep, webProgrammer);
				this.projectList = this.projectList.filter(e => e.status !== this.projectStatus.atWork);
			}
			if (mobileProjects.length > 0) {
				change(mobileProjects, this.listOfDepartments.mobileDep, mobileProgrammer);
				this.projectList = this.projectList.filter(e => e.status != this.projectStatus.atWork);
			}
			mobileProjects = this.listOfDepartments.mobileDep.projectList.filter(e => e.level == 2 || e.level == 3);
			mobileProgrammer = this.listOfDepartments.mobileDep.getFreeProgrammer();
			if (mobileProjects.length > 0) {
				while (mobileProjects.length != 0) {
					if (mobileProgrammer.length > 0) {
						changeProjectInf(mobileProjects, mobileProgrammer);
						mobileProjects = this.listOfDepartments.mobileDep.projectList.filter(e => e.level == 3 && e.numberOfDevelopersEmployed < 3);
						mobileProgrammer = this.listOfDepartments.mobileDep.getFreeProgrammer();
					} else {
						break
					}
				}
			}

		};

	};

	giveProjectsToTesters() {
		if (this.projectListForTest.length > 0) {
			let readyProjects = this.projectListForTest.filter(e => e.status == this.projectStatus.ready);
			let listTesters = this.listOfDepartments.qaDep.getFreeProgrammer();
			if (readyProjects.length > 0) {
				readyProjects.forEach((e) => {
					if (listTesters.length > 0) {
						e.status = this.projectStatus.test;

						e.workingProgrammers.push(listTesters[0])
						this.listOfDepartments.qaDep.projectList.push(e)
						listTesters[0].statusWork = this.statusWorkForProgrammer.busy;
						listTesters[0].numberOfProject += 1;
						listTesters[0].daysDontWork = 0;
					}
					listTesters = this.listOfDepartments.qaDep.getFreeProgrammer();
				})
			}
		}
	}

	changeNumberOfDaysProjects() {
		Object.values(this.listOfDepartments).forEach(e=>{
			if (e.projectList.length > 0) {
				e.projectList.forEach(e => {
					if (e.status == this.projectStatus.atWork) {
						e.changedaysInOperation()
					}
					if (e.status == this.projectStatus.test) {
						e.daysInTest += 1;
					}
				});
			}
		});

		this.getAllProgrammerInDeprtments()
		let allProgrammer = this.listAllProgrammerInDep
		if (allProgrammer.length > 0) {
			allProgrammer.forEach(e => {
				if (e.statusWork == this.statusWorkForProgrammer.free) {
					e.daysDontWork += 1
				}
			})
		}
	}


	statusReadyProjects() {
		let listProjectsWeb = this.listOfDepartments.webDep.projectList;
		if (listProjectsWeb.length > 0) {
			listProjectsWeb.forEach((e) => {
				if (e.level == e.daysInOperation) {
					e.status = this.projectStatus.ready;
					e.workingProgrammers[0].statusWork = this.statusWorkForProgrammer.free;
					e.workingProgrammers = []
					this.projectListForTest.push(e);
				}
			});
			this.listOfDepartments.webDep.projectList = this.listOfDepartments.webDep.projectList.filter(e => e.status != this.projectStatus.ready);
		}

		let listProjectsMobile = this.listOfDepartments.mobileDep.projectList;

		if (listProjectsMobile.length > 0) {
			listProjectsMobile.forEach(e => {
				if (e.level == e.daysInOperation && e.numberOfDevelopersEmployed == 1) {
					e.status = this.projectStatus.ready;
					e.workingProgrammers.forEach(e => e.statusWork = this.statusWorkForProgrammer.free);
					e.workingProgrammers = []
					this.projectListForTest.push(e);
				} else if (e.level - e.numberOfDevelopersEmployed >= 0 && e.daysInOperation == Math.ceil(e.level / e.numberOfDevelopersEmployed)) {
					e.status = this.projectStatus.ready;
					e.workingProgrammers.forEach(e => e.statusWork = this.statusWorkForProgrammer.free);
					e.workingProgrammers = []
					this.projectListForTest.push(e);
				}
			});
			this.listOfDepartments.mobileDep.projectList = this.listOfDepartments.mobileDep.projectList.filter(e => e.status != this.projectStatus.ready);
		}
	}

	completeTheProjects() {
		this.listOfDepartments.qaDep.projectList.filter(e => {
			if (e.status == this.projectStatus.test && e.daysInTest == 1) {
				e.status = this.projectStatus.completed;
				e.workingProgrammers[0].statusWork = this.statusWorkForProgrammer.free;
				e.workingProgrammers = []
				this.listOfCompletedProjects.push(e);
			}
		})
		this.listOfDepartments.qaDep.projectList = this.listOfDepartments.qaDep.projectList.filter(e => e.status != this.projectStatus.completed);
	}

	dismissProgrammer() {
		this.getAllProgrammerInDeprtments()
		let candidatesForDismissal = this.listAllProgrammerInDep.filter(e => e.daysDontWork > 3);
		if (candidatesForDismissal.length > 0) {
			let maxIndex = candidatesForDismissal.reduce((prev, curr, i) => candidatesForDismissal[prev].numberOfProject < curr.numberOfProject ? prev : i, 0);
			candidatesForDismissal[maxIndex].isWorker = false;
			this.listOfDelProgrammer.push(candidatesForDismissal[maxIndex])
			candidatesForDismissal.splice(maxIndex, 1);
			Object.entries(this.listOfDepartments).forEach(e => {
				e[1].programmerList = candidatesForDismissal.filter(p => e[1]._name.toLowerCase() == p.position);
			});

		}
	}

}



let boss = new Boss();
/*let boss2 = new Boss();
console.log(boss===boss2) */
work(365)
function work(day:number) {
	for (let i = day; i > 0; i--) {
		boss.changeNumberOfDaysProjects()
		boss.dismissProgrammer()
		boss.statusReadyProjects()
		boss.completeTheProjects()
		boss.addProgrammer()
		boss.addProject();
		boss.giveProjectsToDevelopers();
		boss.giveProjectsToTesters()
	}
	boss.getAllProgrammerInDeprtments()
	boss.getAllProgrammer()
	console.log(`Количество нанятых программистов: ${boss.listAllProgrammer.length}`)
	console.log(`Количество устроенных программистов: ${boss.listAllProgrammerInDep.length}`)
	console.log(`Количество уволенных программистов: ${boss.listOfDelProgrammer.length}`)
	console.log(`Количество реализованных проектов: ${boss.listOfCompletedProjects.length}`)
	/* 	console.log(boss.listAllProgrammer)
		console.log(boss.listOfCompletedProjects) */
}
import { Component, OnInit } from '@angular/core';
import { Message } from '../../shared/message';
import { AngularFirestore } from '@angular/fire/firestore';
import { moveIn } from '../../router.animations';

@Component({
    selector: 'app-message-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class MessagesViewComponent implements OnInit {
    loading = true;
    messagesList: Message[] = [];
    step = 0;

    constructor(
        private afs: AngularFirestore,
    ) { }

    ngOnInit() {
        this.getData();
    }

    setStep(index: number) {
        this.step = index;
    }

    getData(): void {
        this.messagesList = [];
        this.afs.collection('messages').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const message = new Message();
                message.title = doc.data()['title'];
                message.dateCreated = doc.data()['dateCreated'];
                message.message = doc.data()['message'];
                message.createdByName = doc.data()['createdByName'];
                message.createdByImage = doc.data()['createdByImage'];
                message.employeeList = doc.data()['employeeList'];
                message.uid = doc.id;
                this.messagesList.push(message);
            });
            this.loading = false;
            this.messagesList.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
        });
    }
}

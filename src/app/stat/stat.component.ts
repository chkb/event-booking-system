import { Component, OnInit, Input } from '@angular/core';
import { Stat } from '../shared/stat';

@Component({
    selector: 'app-stat',
    templateUrl: './stat.component.html',
    styleUrls: ['./stat.component.less']
})
export class StatComponent implements OnInit {
    @Input() stat: Stat;
    constructor() { }

    ngOnInit() {
    }

}

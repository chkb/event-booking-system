import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-animation',
    templateUrl: './animation.component.html',
    styleUrls: ['./animation.component.css'],
    animations: [
        trigger('heroState', [
            state('inactive', style({
                backgroundColor: '#eee',
                transform: 'scale(1)'
            })),
            state('active', style({
                backgroundColor: '#cfd8dc',
                transform: 'scale(1.1)'
            })),
            transition('inactive => active', animate('200ms ease-in')),
            transition('active => inactive', animate('200ms ease-out'))
        ]),
        trigger('flyInOut', [
            state('in', style({ opacity: 1, transform: 'translateX(0)' })),
            transition('void => *', [
                style({
                    opacity: 0,
                    transform: 'translateX(-100%)'
                }),
                animate('0.5s ease-in')
            ])
        ]),
        trigger('flyInOut-3sec', [
            state('in', style({ opacity: 1, transform: 'translateX(0)' })),
            transition('void => *', [
                style({
                    opacity: 0,
                    transform: 'translateX(-100%)'
                }),
                animate('0.5s 1s ease-in')
            ]),
            transition('* => void', [
                animate(100, style({ transform: 'translateX(100%)' }))
            ])
        ])
    ]
})
export class AnimationComponent implements OnInit {

    List = [
        { name: 'Test 1', state: 'inactive' },
        { name: 'Test 2', state: 'inactive' },
        { name: 'Test 3', state: 'inactive' },
        { name: 'Test 4', state: 'inactive' }
    ];

    List2 = [
        { name: 'Test 1', state: '' },
        { name: 'Test 2', state: '' },
        { name: 'Test 3', state: '' },
        { name: 'Test 4', state: '' }
    ];

    constructor() { }

    ngOnInit() {
    }

    toggleState(item: any): void {
        item.state = item.state === 'active' ? 'inactive' : 'active';
    }

    toggleState2(item: any): void {
        item.state = item.state === 'in' ? '' : 'in';
    }

}

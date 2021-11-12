import VueRouter from 'vue-router';

import Projects from './components/projects';
import Project from './components/project';
import V2Project from './components/v2/project';
import V2ProjectStep1 from './components/v2/step1';
import V2ProjectStep2 from './components/v2/step2';
import V2ProjectStep3 from './components/v2/step3';

import Log from './components/log/index';

const routes = [
    {path: '/', component: Projects},
    {path: '/projects', component: Projects},

    {path: '/log', component: Log},

    {path: '/project', component: Project},

    {
        path: '/v2/project', component: V2Project,
        children: [
            {
                path: 'step1',
                component: V2ProjectStep1
            },
            {
                path: 'step2',
                component: V2ProjectStep2
            },
            {
                path: 'step3',
                component: V2ProjectStep3
            }
        ]
    },
];

const router = new VueRouter({
    mode: 'history',
    routes
});

export default router;

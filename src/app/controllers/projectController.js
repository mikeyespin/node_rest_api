const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

router.use(authMiddleware);

//rota do LIST - lista todos os projetos
router.get('/', async (req, res) => {

    try {
        const projects = await Project.find().populate(['user', 'tasks']);

        return res.send({ projects});
    } catch (error) {
        return res.status(400).send({error:'Error loading projects'});
        
    }
    
});
//rota do SHOW - lista o projeto identificado com o ID
router.get('/:projectId', async (req, res)=>{
    
    try {
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);

        return res.send({ project});
    } catch (error) {
        return res.status(400).send({error:'Error loading project'});
        
    }
});
//rota CREATE - cria o projeto 
router.post('/', async (req, res)=>{

    try {

        const {title, description, tasks} = req.body;

        const project = await Project.create({ title, description, user: req.userId});

        await Promise.all(tasks.map(async task =>{
            const projectTask = new Task({ ...task, project: project._id});

            await projectTask.save();
            
            project.tasks.push(projectTask);
        }));

        await project.save();

        return res.send({ project }); 

    } catch (error) {   console.log(error);
        return res.status(400).send({ error: 'Error creating new project'});
        
    }
    
});
//rota PUT - atualiza o projeto
router.put('/:projectId', async (req, res)=>{
    
    try {

        const {title, description, tasks} = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectId, { 
            title, 
            description
        }, { new: true});

        project.tasks = [];
        await Task.remove({ project: project._id});

        await Promise.all(tasks.map(async task =>{
            const projectTask = new Task({ ...task, project: project._id});

            await projectTask.save();
            
            project.tasks.push(projectTask);
        }));

        await project.save();

        return res.send({ project }); 

    } catch (error) {   console.log(error);
        return res.status(400).send({ error: 'Error updating project'});
        
    }
});
//rota DELETE - deleta o projeto
router.delete('/:projectId', async (req, res)=>{
    
    try {
        await Project.findByIdAndRemove(req.params.projectId);

        return res.send('Registry deleted');
    } catch (error) {
        return res.status(400).send({error:'Error deleting project'});
        
    }
});

module.exports = app => app.use('/projects', router);

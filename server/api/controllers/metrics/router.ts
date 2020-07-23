import express from 'express';
import controller from './controller';
export default express
    .Router()
    .post('/:key', controller.log)
    .get('/:key/sum', controller.sumByKey);

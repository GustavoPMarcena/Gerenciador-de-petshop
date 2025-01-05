import express, { Request, Response, NextFunction } from 'express';
import { v4 as criarID } from 'uuid';

const app = express();
const port = 5000;
app.use(express.json());

type Pets = {
    id: string,
	name: string,
	type: string,
	description:  string,
	vaccinated:  boolean,   
	deadline_vaccination: Date, 
	created_at: Date
  }
  
type PetShop = {
    id: string;
    name: string;
    cnpj: string;
    pets: Pets[];
}


// Array de objetos em que eu vou trabalhar nesta atividade

let petshops: PetShop[] = [];

// MIDDLEWARES

// VErificar se o usuário da requisição está correto

function verificarPetShopPorID(request: Request, response: Response, next: NextFunction) {
    const id = request.params.id;
    const user = petshops.find(loja => loja.id === id);
    if (user) {
      response.status(400).json("error: já cadastrado");
      return;
    }
  
    next();
}

function verificarFormatoCNPJ(req: Request, res: Response, next: NextFunction) {
    const formatoCNPJ = /^\d{2}\.\d{3}\.\d{3}\/0001-\d{2}$/;
    const info = req.params.cnpj;
    if (!formatoCNPJ.test(info)) {
        res.status(400).json({error: "cnpj no formato incorreto"});
        return;
    } 
  
    next();
}

function checarContaExistente(req: Request, res: Response, next: NextFunction) {
    const cnpj = req.headers.cnpj;
    const loja = petshops.find(index => index.id === cnpj);

    if (!loja) {
        res.status(400).json("error:usuário inexistente");
        return;
    }
    
    req.petshop = loja;
    next();
}

// Rotas

app.post('/petshops', verificarFormatoCNPJ, verificarPetShopPorID, (req, res) => {
    const dados = req.body as PetShop; 
    const novaLoja: PetShop | null = {
        id: criarID(),
        name: dados.name,
        cnpj: dados.cnpj,
        pets: []
    }
    if (!novaLoja) {
        res.status(400).json({error: "O Petshop não foi cadastrado"});
        return;
    }
    petshops.push(novaLoja);
    res.status(201).json({ message: "Petshop cadatrado com sucesso" });
    return;
});

app.get('/pets/:cnpj', checarContaExistente, (req, res) => {
    res.status(200).json(req.petshop.pets);
    return;
});

app.post('/pets/:cnpj', checarContaExistente, (req, res) => {
    const dados = req.body as Pets;
    const novoPet: Pets | null = {
        id: criarID(),
        name: dados.name,
        type: dados.type,
        description: dados.description,
        vaccinated: false,
        deadline_vaccination: dados.deadline_vaccination,
        created_at: new Date()
    }
    if (!novoPet) {
        res.status(400).json({error: "O pet não foi cadastrado"});
        return;
    }

    req.petshop.pets.push(novoPet);
});


app.listen(port, () => {
    console.log("server online on port 3000");
});
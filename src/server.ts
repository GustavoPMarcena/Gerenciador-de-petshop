import express, { Request, Response, NextFunction } from 'express';
import { v4 as criarID } from 'uuid';

const app = express();
const port = 3000;
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

function verificarPetShopPorCNPJ(request: Request, response: Response, next: NextFunction) {
    const cnpj = request.body.cnpj;
    const user = petshops.find(loja => loja.cnpj === cnpj);
    if (user) {
      response.status(400).json("error: já cadastrado");
      return;
    }
  
    next();
}

function verificarFormatoCNPJ(req: Request, res: Response, next: NextFunction) {
    const formatoCNPJ = /^\d{2}\.\d{3}\.\d{3}\/0001-\d{2}$/;
    const info = req.body.cnpj; // Corrigido para pegar do corpo da requisição
    if (!formatoCNPJ.test(info)) {
        res.status(400).json({ error: "CNPJ no formato incorreto" });
        return;
    }
    next();
}

function checarContaExistente(req: Request, res: Response, next: NextFunction) {
    const cnpj = req.headers.cnpj;
    const loja = petshops.find(index => index.cnpj === cnpj);

    if (!loja) {
        res.status(400).json("error:usuário inexistente");
        return;
    }
    
    req.petshop = loja;
    next();
}

// Rotas

app.post('/petshops', verificarFormatoCNPJ, verificarPetShopPorCNPJ, (req, res) => {
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

app.get('/pets/', checarContaExistente, (req, res) => {
    res.status(200).json(req.petshop.pets);
    return;
});

app.post('/pets/', checarContaExistente, (req, res) => {
    const dados = req.body as Pets;
    const novoPet: Pets | null = {
        id: criarID(),
        name: dados.name,
        type: dados.type,
        description: dados.description,
        vaccinated: false,
        deadline_vaccination: new Date(dados.deadline_vaccination),
        created_at: new Date()
    }
    if (!novoPet) {
        res.status(400).json({error: "O pet não foi cadastrado"});
        return;
    }

    req.petshop.pets.push(novoPet);
    res.status(201).json({ message: "Petshop cadatrado com sucesso", novoPet });
    return;
});

app.put('/pets/:id', checarContaExistente, (req, res) => {
    const idPet = req.params.id;
    const { name, type, description, deadline_vaccination } = req.body; 
    const pet = req.petshop.pets.find(p => p.id === idPet);

    if (!pet) {
        res.status(404).json({ error: "Pet não encontrado." });
        return;
    }

    pet.name = name || pet.name;
    pet.type = type || pet.type;
    pet.description = description || pet.description;
    pet.deadline_vaccination = deadline_vaccination
        ? new Date(deadline_vaccination)
        : pet.deadline_vaccination;

    petshops = petshops.map(petshop =>
        petshop.id === req.petshop.id ? req.petshop : petshop
    );

    res.status(200).json({ message: "Pet atualizado com sucesso.", pet });
    return ;
});

app.patch('/pets/:id/vaccinated', checarContaExistente, (req, res) => {
    const idPet = req.params.id;
    let check = false;
    req.petshop.pets.forEach(element => {
        if(element.id == idPet) {
            element.vaccinated = true;
            check = true;
        } 
    });

    if(!check) {
        res.status(400).json({ error: "Pet não encontrado." });
        return;
    }

    petshops = petshops.map(petshop =>
        petshop.id === req.petshop.id ? req.petshop : petshop
    );

    res.status(200).json({ message: "Pet atualizado com sucesso." });
    return;
    
});

app.delete('/pets/:id', checarContaExistente, (req, res) => {
    const idPet = req.params.id;
    const novaLista = req.petshop.pets.filter(pet => pet.id !== idPet);

    if (req.petshop.pets.length === novaLista.length) {
        res.status(404).json({ error: "Pet não encontrado." });
        return ;
    }
    
    req.petshop.pets = novaLista;
    petshops = petshops.map(petshop =>
        petshop.id === req.petshop.id ? req.petshop : petshop
    );

    res.status(200).json({ message: "Pet removido com sucesso." });
    return;
});


app.listen(port, () => {
    console.log("server online on port 3000");
});
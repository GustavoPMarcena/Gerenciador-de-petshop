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

declare namespace Express {
    export interface Request {
        petshop: PetShop; 
        pets: Pets;
    }
}
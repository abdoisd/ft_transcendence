// let age: number = 20;
// if (age < 50)
// 	age += 10;
// console.log(age);

// let sales = 20;

// let typeAny;
// typeAny = 10;
// typeAny = "klsdjfldj";
// function ft(obj: any)
// {
// 	console.log(obj);
// }

// let numbers: number[] = [1, 2, 3]
// numbers.forEach(n => console.log(n.toString()))

// function ft2(obj?: any): number // ?: ts optional
// {
// 	if ((obj || 1000) < 2000)
// 		return 10;
// 	return 20;
// 	// return undefined by default
// }
// // ft2({}, {});

// let user: { // setting a type for js obj
// 	readonly Id: number // readonly property
// 	name: string
// 	update: (date: Date) => void
// } = {
// 	Id: 1,
// 	name: "",
// 	update: (date: Date) =>
// 	{
// 		console.log(date)
// 	}
// }
// user.name = "ldjf"; // adding a property

// // you can make a type with type
// // type User = {
// // 	readonly id: number
// // 	name: string
// // 	retire: (date: Date) => void
// // }

// // union type
// function kgTobs(weight: number | string): string
// {
// 	if (typeof weight === "number")
// 		return weight.toString();
// 	else
// 		return weight.concat("dklfjdlfj");
// }
// kgTobs(10);
// kgTobs('10');

// // liternal types
// let quantity: 1; // greate
// quantity = 1;

// function ft3(obj: number | null)
// {
// }
// ft3(null);

// if (null == undefined) // use null always
// 	console.log("something")

type User = { Id: number; name: string };
let user2: User = {
	Id: 1,
	name: "",
};
function ft4(user: User | null)
{
	console.log(user?.Id); // ? generates safe code !!!!!! YES IT DOES
}
ft4(user2);

let log: any = null;
log?.("a");

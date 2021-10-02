/*
Keys inside the schema object should be pointing to a mongo field.
Key '_id'(userSchema.schema._id) is pointing to mongoDB users collection field _id.
The field typeCases will define the types that field will accept as entry.
Note that if you're defining a field here, it doesn't mean it should exist in every document; However It's important to define what will happen if the value is undefiend inside the schema.fieldName.destinations[index].ifUndefined (instance of SkipField as value in ifUndefiend means skip the field and instance of SkipEntity as value means skip this entity).
The field ifUndefined can be either a hardcoded value or a function; Remember that if you pass a function as value for isUndefined, the entity will be passed to it as an argument.
The field ifNull is the same as ifUndefined but triggers on null value instead of undefiend value.
The field ifUndefinedOrNull triggers if value is undefined or null.
You can either set ifNull and ifUndefined or ifUndefinedOrNull.
The field manipulation accepts a function or null, Parameter entity will be passed to the function. If field manipulation is not null then the function will be called and the result will replace the value of that field. Note: It's not important if the result of the function is the same as datatype of the field.
*/
const { SkipEntity, SkipField } = require('./field-actions/utils/skip');

const userSchema = {
    collection: 'users',
    schema: {
        _id: {
            typeCases: ['string'],
            destinations: [{
                tableName: 'users',
                fieldName: 'id',
                ifUndefined: new SkipEntity(),
                ifNull: new SkipEntity(),
                manipulation: null
            }],
        },
        fullName: {
            typeCases: ['string'],
            destinations: [{
                tableName: 'users',
                fieldName: 'first_name',
                ifUndefined: new SkipField(),
                ifNull: new SkipField(),
                manipulation: (entity) => {
                    return entity.fullName.split(' ')[0];
                }
            }, {
                tableName: 'users',
                fieldName: 'last_name',
                ifUndefined: new SkipField(),
                ifNull: new SkipField(),
                manipulation: (entity) => {
                    return entity.fullName.split(' ')[1];
                }
            }],
        },
        isActive: {
            typeCases: ['boolean'],
            destinations: [{
                tableName: 'users',
                fieldName: 'is_active',
                ifUndefined: false,
                ifNull: false,
                manipulation: null
            }]
        },
        isEnabled: {
            typeCases: ['boolean'],
            destinations: [{
                tableName: 'users',
                fieldName: 'is_enabled',
                ifUndefined: (entity) => {
                    return entity.isActive;
                },
                ifNull: (entity) => {
                    return entity.isActive;
                },
                ifUndefinedOrNull:(entity) => {
                    return entity.isActive;
                },
                manipulation: null
            }]
        },
        isUnderaged: {
            typeCases: ['boolean'],
            destinations: [{
                tableName: 'users',
                fieldName: 'is_underaged',
                ifUndefinedOrNull:(entity) => {
                    return entity.age >= 18;
                },
                manipulation: null
            }]
        },
    }
};

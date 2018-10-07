#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>
#include <pthread.h>
#include <time.h>
#include <errno.h>
#include <assert.h>

#define hash_table_size 20

typedef char *(*Getter)(char *key, int partition_number);
typedef void (*Mapper)(char *file_name);
typedef void (*Reducer)(char *key, Getter get_func, int partition_number);
typedef unsigned long (*Partitioner)(char *key, int num_partitions);

void MR_Emit(char *key, char *value);

unsigned long MR_DefaultHashPartition(char *key, int num_partitions);

void MR_Run(int argc, char *argv[],
            Mapper map, int num_mappers,
            Reducer reduce, int num_reducers,
            Partitioner partition);



int num_files;
int cur_file;
int cur_partition_hashIndex;
int num_finished_map;
int num_finished_partition;
int num_finished_sort;
int num_finished_reduce;
int* partitioned_length;
struct pair ***partitioned_result;
char** file_list;
int num_partition;
int cur_sort_partition;
int cur_reduce_partition;
int ** track_indices;
int *cur_reduce_pair;


pthread_mutex_t map_lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t map_cond = PTHREAD_COND_INITIALIZER;
pthread_mutex_t partition_lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t partition_cond = PTHREAD_COND_INITIALIZER;
pthread_mutex_t* partition_locks;
pthread_mutex_t sort_lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t sort_cond = PTHREAD_COND_INITIALIZER;
pthread_mutex_t reduce_lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t reduce_cond = PTHREAD_COND_INITIALIZER;

/* For Hash Table */

typedef struct pair
{
    char *key;
    struct pair* next;
    int value_num;
    char **value;
} pair;

struct pair** hashArray;

unsigned long
hash(char *str)
{
    unsigned long hash = 5381;
    int c;
    
    while ((c = *str++)){
        hash = ((hash << 5) + hash) + c; /* hash * 33 + c */
    }
    hash = hash % hash_table_size;
    return hash;
}
pair* search(char* key){

  int hashIndex = hash(key);

    if (hashArray[hashIndex] != NULL){

      struct pair* cur_pair = hashArray[hashIndex];
      while (cur_pair != NULL){

	if (strcmp(cur_pair->key, key) == 0){

	  return cur_pair;
            }
            cur_pair = cur_pair->next;
        }
    }
    return NULL;
}
void insert(char* key, char* value){
    struct pair* search_pair = search(key);
    if (search_pair != NULL){
           search_pair->value_num += 1;
        search_pair->value = realloc(search_pair->value, search_pair->value_num * sizeof(char*));
        *(search_pair->value + (search_pair->value_num - 1)) = value;

    } else {
        int hashIndex = hash(key);
        struct pair* new_pair = malloc(sizeof(pair));
        new_pair->key = key;
        new_pair->next = NULL;
        new_pair->value_num = 1;
        new_pair->value = malloc(new_pair->value_num*sizeof(char*));
        *(new_pair->value) = value;
        
        if (hashArray[hashIndex] == NULL){
            hashArray[hashIndex] = new_pair;
        } else{
            struct pair* cur_pair = hashArray[hashIndex];
            struct pair* pre_pair = NULL;
            while(cur_pair!=NULL){
                pre_pair = cur_pair;
                cur_pair = cur_pair->next;
            }
            pre_pair->next = new_pair;
        }
    }
}

void display(){
    int i = 0;
    for (i = 0; i<hash_table_size;i++){
        if(hashArray[i]!=NULL)
        {
            int k;
            for (k = 0; k < hashArray[i]->value_num; k++){
	      printf("(%s,%s) %d\n",hashArray[i]->key,*(hashArray[i]->value+k),i);
            }
            struct pair* cur_pair = hashArray[i]->next;
            while (cur_pair != NULL){
                int k;
                for (k = 0; k < cur_pair->value_num; k++){
		  printf("(%s,%s) %d n\n",cur_pair->key,*(cur_pair->value+k),i);
                }
		cur_pair = cur_pair ->next;
            }
        }
    }
}

/* end */
unsigned long MR_DefaultHashPartition(char *key, int num_partitions) {
    unsigned long hash = 5381;
    int c;
    while ((c = *key++) != '\0')
        hash = hash * 33 + c;
    return hash % num_partitions;
}

void Map(char *file_name) {
    FILE *fp = fopen(file_name, "r");
    assert(fp != NULL);

    char *line = NULL;
    size_t size = 0;
    while (getline(&line, &size, fp) != -1) {
        char *token, *dummy = line;
        while ((token = strsep(&dummy, " \t\n\r")) != NULL) {
            MR_Emit(token, "1");
        }
    }
    fclose(fp);
}

void Reduce(char *key, Getter get_next, int partition_number) {
    int count = 0;
    char *value;
    while ((value = get_next(key, partition_number)) != NULL)
        count++;
    printf("%s %d\n", key, count);
}

void MR_Emit(char *key, char *value){
  insert(key, value);
  //printf("%s %s\n", key, value);
}

void* pre_map(void *map){
    while(1){
        pthread_mutex_lock(&map_lock);
        int assigned_file = -1;
        if (cur_file != num_files){
            assigned_file = cur_file;
            cur_file++;
        }
        pthread_mutex_unlock(&map_lock);
        if (assigned_file != -1){
            void (*map2)(char *file_name)= (void (*)(char *file_name))map;
            map2(file_list[assigned_file+1]);
            num_finished_map ++;
        }
        
        if (num_finished_map == num_files){
            pthread_cond_signal(&map_cond);
            return 0;
        }
    }
}

void* pre_partition(void *partition){
    while(1){
        pthread_mutex_lock(&partition_lock);
        int assigned_index = -1;
        if (cur_partition_hashIndex != hash_table_size){
            assigned_index = cur_partition_hashIndex;
            cur_partition_hashIndex++;
            
        }
        pthread_mutex_unlock(&partition_lock);
        
        if (assigned_index != -1){
            
            unsigned long (*partition2)(char *key, int num_partitions)= (unsigned long (*)(char *key, int num_partitions))partition;
            
            struct pair* cur_pair = hashArray[assigned_index];
            
            while (cur_pair != NULL){
                int partition_to = partition2(cur_pair->key, num_partition);
                pthread_mutex_lock(&partition_locks[partition_to]);
                int assigned_partition_index = partitioned_length[partition_to];
                partitioned_length[partition_to]++;
                partitioned_result[partition_to] = realloc(partitioned_result[partition_to], partitioned_length[partition_to] * sizeof(struct pair));
                pthread_mutex_unlock(&partition_locks[partition_to]);
                partitioned_result[partition_to][assigned_partition_index] = cur_pair;
                cur_pair = cur_pair->next;
            }
            num_finished_partition++;
        }
        
        if (num_finished_partition == hash_table_size){
            pthread_cond_signal(&sort_cond);
            return 0;
        }
    }
    
}

int cmpfunc(const void * a, const void * b){
    return strcmp((*(struct pair  **) a)->key,
                  (*(struct pair  **) b)->key);
}

void* pre_sort(void* arg){
    while(1){
        pthread_mutex_lock(&sort_lock);
        int assigned_partition = -1;
        if (cur_sort_partition != num_partition){
            assigned_partition = cur_sort_partition;
            cur_sort_partition++;
        }
        pthread_mutex_unlock(&sort_lock);
        if (assigned_partition != -1){
            qsort(partitioned_result[assigned_partition], partitioned_length[assigned_partition],sizeof(struct pair *), cmpfunc);
	    num_finished_sort ++;
        }
        if (num_finished_sort == num_partition){
            pthread_cond_signal(&sort_cond);
            return 0;
        }
    }
    
}

char* get_next(char *key, int partition_number){
    struct pair* cur_pair = partitioned_result[partition_number][cur_reduce_pair[partition_number]];
    if (cur_pair->value_num == track_indices[partition_number][cur_reduce_pair[partition_number]]){
        return NULL;
    } else {
        char* result = cur_pair->value[track_indices[partition_number][cur_reduce_pair[partition_number]]];
        track_indices[partition_number][cur_reduce_pair[partition_number]] ++;
        return result;
    }
}

void *pre_reduce(void* reduce){
    while(1){
        pthread_mutex_lock(&reduce_lock);
        int assigned_partition = -1;
        if (cur_reduce_partition != num_partition){
            assigned_partition = cur_reduce_partition;
            cur_reduce_partition++;
        }
        pthread_mutex_unlock(&reduce_lock);
        if (assigned_partition != -1){
            void (*reduce2)(char *key, Getter get_func, int partition_number)= (void (*)(char *key, Getter get_func, int partition_number))reduce;
            int i;
            for (i = 0; i < partitioned_length[assigned_partition];i++){
                reduce2(partitioned_result[assigned_partition][i]->key, get_next, assigned_partition);
                cur_reduce_pair[i]++;
            }
            num_finished_reduce ++;
        }
        
        if (num_finished_reduce == num_partition){
            pthread_cond_signal(&reduce_cond);
            return 0;
        }
    }
}

void MR_Run(int argc, char *argv[], Mapper map, int num_mappers, Reducer reduce,
            int num_reducers, Partitioner partition){
    num_files = argc - 1;

    num_finished_map = 0;
    cur_file = 0;
    pthread_t threads[num_mappers];
    file_list = argv;
    hashArray = calloc(hash_table_size, sizeof(struct pair*));
    
    
    //map
    int i;
    for (i = 0; i < num_mappers;i++){
      pthread_create(&threads[i], NULL, pre_map, (void *)map);
    }
    pthread_mutex_lock(&map_lock);
    while (num_finished_map != num_files){
        pthread_cond_wait(&map_cond, &map_lock);
    }
    pthread_mutex_unlock(&map_lock);

    display();
    
    // partition
    num_partition = num_reducers;
    cur_partition_hashIndex = 0;
    partitioned_length = malloc(num_reducers * sizeof(int));
    partition_locks = malloc(num_reducers * sizeof(pthread_mutex_t));
    partitioned_result = malloc(num_reducers * sizeof(struct pair **));
    for (i = 0; i < num_reducers; i++){
      pthread_mutex_init(&partition_locks[i],NULL);
    }

    for (i = 0; i < num_reducers; i++){
        partitioned_length[i] = 0;
    }

    for (i = 0; i < num_reducers; i++){
        partitioned_result[i] = malloc(sizeof(struct pair));
    }

    for (i = 0; i < num_mappers;i++){
        pthread_create(&threads[i], NULL, pre_partition, (void *)partition);
    }

    pthread_mutex_lock(&partition_lock);
    while (num_finished_partition != hash_table_size){
        pthread_cond_wait(&partition_cond, &partition_lock);
    }
    pthread_mutex_unlock(&partition_lock);

    for (i = 0; i< num_reducers; i++){
      for (int k =0; k < partitioned_length[i]; k++){
          printf("%d %s %d\n", i, partitioned_result[i][k]->key, partitioned_result[i][k]->value_num);
      }
    }
    
    // sort
    cur_sort_partition = 0;
    num_finished_sort = 0;
    for (i = 0; i < num_reducers;i++){
        pthread_create(&threads[i], NULL, pre_sort, NULL);
    }
    pthread_mutex_lock(&sort_lock);
    while (num_finished_sort != num_reducers){
        pthread_cond_wait(&sort_cond, &sort_lock);
    }
    pthread_mutex_unlock(&sort_lock);
    
    for (i = 0; i< num_reducers; i++){
        for (int k =0; k < partitioned_length[i]; k++){
            printf("%d %s %d\n", i, partitioned_result[i][k]->key, partitioned_result[i][k]->value_num);
        }
    }
    
    // reduce
    cur_reduce_partition = 0;
    num_finished_reduce = 0;
    track_indices = calloc(num_partition, sizeof(int*));
    cur_reduce_pair = calloc(num_partition, sizeof(int));
    for (i = 0; i < num_partition; i++){
        track_indices[i] = calloc(partitioned_length[i],sizeof(int));
    }
    
    
    for (i = 0; i < num_reducers;i++){
        pthread_create(&threads[i], NULL, pre_reduce, NULL);
    }
    pthread_mutex_lock(&reduce_lock);
    while (num_finished_reduce != num_reducers){
        pthread_cond_wait(&reduce_cond, &reduce_lock);
    }
    pthread_mutex_unlock(&reduce_lock);
    
}

int main(int argc, char *argv[]) {
  MR_Run(argc, argv, Map, 10, Reduce, 3, MR_DefaultHashPartition);
}



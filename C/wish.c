#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

char** path;
int file_mode;
FILE* file1;

void initialize_path(){
    path = malloc(sizeof(char*));
    path[0] = "/bin";
}

void reinitialize_path(size_t len){
    path = realloc(path, len/2*sizeof(char*) + 1);
    int i =0 ;
    for (i = 0; i < len/2+1; i++){
        path[i]=malloc(len);
    }
}

void clear_path(size_t len){
    int i;
    for (i = 0; i< len/2+1; i++){
        free(path[i]);
    }
    memset(path, 0, len/2*sizeof(char*) + 1);
}

void Error(){
    char error_message[30] = "An error has occurred\n";
    write(STDERR_FILENO, error_message, strlen(error_message));
}

char** parse_line(char* line, size_t len){
    char** result = malloc(len/2*sizeof(char*) + 4);
    char* search = " ";
    char* token = strtok(line, search);
    int index = 0;
    while (token != NULL){
        result[index] = token;
        index ++;
        token = strtok(NULL, search);
    }
    result[index] = NULL;
    return result;
}

char* redirection_parse(char* line, size_t len){
    char* result = malloc(len * 3);
    int count = 0;
    int count2 = 0;
    while(line[count] != '\0'){
        if (line[count] != '>'){
            result[count2] = line[count];
        } else{
            if(result[count2 - 1] != ' '){
                result[count2] = ' ';
                count2 ++;
            }
            result[count2] = '>';
            if (line[count+1] != ' '){
                count2++;
                result[count2] = ' ';
            }
            
        }
        count2++;
        count++;
    }
    result[count2] = '\0';
    return result;
}

char* parallel_parse(char* line, size_t len){
    char* result = malloc(len * 3);
    int count = 0;
    int count2 = 0;
    while(line[count] != '\0'){
        if (line[count] != '&'){
            result[count2] = line[count];
        } else{
            if(result[count2 - 1] != ' '){
                result[count2] = ' ';
                count2 ++;
            }
            result[count2] = '&';
            if (line[count+1] != ' '){
                count2++;
                result[count2] = ' ';
            }
        }
        count2++;
        count++;
    }
    result[count2] = '\0';
    return result;
}

char* check_command(char* command, size_t len){
    int i = 0;
    int flag = 0;
    char* correct_path;
    for (i = 0; i < len/2 + 1; i++){
        if (path[i] != NULL){
            char* final_path = malloc(1+strlen(path[i])+strlen(command));
            strcpy(final_path, path[i]);
            final_path = strcat(final_path, "/");
            final_path = strcat(final_path, command);
            int result = access(final_path, X_OK);
           
            if (result == 0){
                flag = 1;
                correct_path = final_path;
                break;
            }
        }
    }
    
    if (flag){
        return correct_path;
    } else{
        return NULL;
    }
}

void wish_loop(){
    initialize_path();
    size_t path_num = 1;
    
    do {
        
        if(!file_mode){
            printf("wish> ");
            fflush(stdout);
        }
        char* pre_line = NULL;
        size_t buffer_size = 0;
        if (!file_mode){
            size_t ttt = getline(&pre_line, &buffer_size, stdin);
            if (ttt == -1){
                break;
            }
        } else {
            size_t ttt = getline(&pre_line, &buffer_size, file1);
            if (ttt == -1){
                break;
            }
        }
        pre_line[strcspn(pre_line, "\n")] = 0;
        size_t len = strlen(pre_line);
        char* redirected_line = redirection_parse(pre_line, len);
        len = strlen(redirected_line);
        char* paralled_line = parallel_parse(redirected_line, len);
        char** line = parse_line(paralled_line, len);
        char* token = line[0];
        if (token != NULL){
            if (strcmp(token, "exit") == 0 || strcmp(token, "cd") == 0 || strcmp(token, "path") == 0){
                if (strcmp(token, "exit") == 0){
                    char* token1 = line[1];
                    if (token1 == NULL){
                        exit(0);
                    } else {
                        Error();
                    }
                } else if (strcmp(token, "cd") == 0){
                    char* token1 = line[1];
                    char* token2 = line[2];
                    if (token1 == NULL || token2 != NULL){
                        Error();
                    } else {
                        int i = chdir(token1);
                        if (i == -1){
                            Error();
                        }
                    }
                } else if (strcmp(token, "path") == 0){
                    int i = 1;
                    char* token1 = line[i];
                    
                    reinitialize_path(len);
                    path_num = len;
                    int count = 0;
                    while (token1 != NULL){
                        strcpy(*(path + count), token1);
                        i++;
                        token1 = line[i];
                        count += 1;
                    }
                }
            } else {
                int last_i = 0;
                int redirection = 0;
                int status;
                pid_t pid, wpid;
               
                while (line[redirection] != NULL ){
                    if (redirection != 0){
                        redirection += 1;
                        last_i += 1;
                    }
                    if (line[redirection] == NULL){
                        break;
                    }
                    char* command_path = check_command(line[redirection], path_num);
                
                    if (command_path != NULL){
                        char** arguments = line;
                        int flag = 0;
                        int flag2 = 0;
                        while (line[redirection] != NULL && strcmp(line[redirection], "&") != 0) {
                            if (strcmp(line[redirection],">") == 0){
                                flag  = 1;
                                break;
                            }
                            redirection += 1;
                        }
                        if (flag){
                            int multi_count = redirection + 1;
                            while (line[multi_count] != NULL && strcmp(line[multi_count], "&") != 0){
                                if (strcmp(line[multi_count],">") == 0){
                                    
                                    Error();
                                   
                                    flag2 = 1;
                                    break;
                                }
                                multi_count += 1;
                            }
                        }
                        if (!flag2){
                            char * filename;
                            if (flag){
                                if (line[redirection + 1] == NULL || (line[redirection + 2]!= NULL && strcmp(line[redirection + 2], "&") != 0)){
                                    Error();
                                    break;
                                }
                                filename = line[redirection + 1];
                            }
                            
                            char** args2 = malloc((redirection - last_i + 1)*sizeof(*arguments));
                            memcpy(args2,arguments + last_i, (redirection - last_i)*sizeof(*arguments));
                            args2[redirection-last_i] = NULL;
                           
                            if (flag){
                                redirection += 2;
                            }
                            last_i = redirection;
                    
                            pid = fork();
                            if (pid == 0){
                                if (flag){
                                    freopen(filename, "w", stdout);
                                }
                                execv(command_path, args2);
                            }
                            free(args2);
                            
                        } else {
                            break;
                        }
                    } else {
                        if( strcmp(line[redirection], "&") != 0){
                            Error();
                        }
                        break;
                    }
                    free(command_path);
                }
                while ((wpid = wait(&status)) > 0);
            }
        }
    
        free(paralled_line);
        free(redirected_line);
        free(line);
        
    } while(1);
}

int main(int argc, char* argv[]){
    if (argc == 2){
        file1 = fopen(argv[1], "r");
        if (file1 == NULL){
            Error();
            exit(1);
        }
        file_mode = 1;
        wish_loop();
        fclose(file1);
    } else if (argc == 1){
        file_mode = 0;
        wish_loop();
    } else {
        Error();
        exit(1);
    }
}


